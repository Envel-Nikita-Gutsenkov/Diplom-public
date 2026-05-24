import fs from "fs"
import path from "path"
import archiver from "archiver"
import unzipper from "unzipper"
import prisma from "./prisma"
import { Readable } from "stream"

const BACKUP_DIR = path.join(process.cwd(), "backups")
const DEFAULT_RETENTION = 3
const MAX_PHYSICAL_LIMIT = 10

if (!fs.existsSync(BACKUP_DIR)) {
  try {
    fs.mkdirSync(BACKUP_DIR, { recursive: true })
  } catch (e) {
    console.error(`[Backup] Failed to create backup directory: ${BACKUP_DIR}`, e)
  }
}

function getSettingsModel(tx?: any) {
    const client = tx || prisma
    return client.globalSettings || client.GlobalSettings || client.globalsettings
}

export async function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const fileName = `backup-${timestamp}.zip`
  const filePath = path.join(BACKUP_DIR, fileName)
  const tempPath = `${filePath}.tmp`

  console.log(`[Backup] Starting creation of ${fileName}`)

  const data = {
    users: await prisma.user.findMany(),
    accounts: await prisma.account.findMany(),
    sessions: await prisma.session.findMany(),
    verificationTokens: await prisma.verificationToken.findMany(),
    olympiads: await prisma.olympiad.findMany(),
    tasks: await prisma.task.findMany(),
    submissions: await prisma.submission.findMany(),
    results: await prisma.result.findMany(),
    globalSettings: await (getSettingsModel()?.findMany() || []),
  }

  const output = fs.createWriteStream(tempPath)
  const archive = archiver("zip", { zlib: { level: 9 } })

  return new Promise<{ fileName: string, filePath: string }>((resolve, reject) => {
    output.on("close", async () => {
      try {
        fs.renameSync(tempPath, filePath)
        console.log(`[Backup] Archive finalized: ${filePath}`)
        
        await cleanOldBackups()
        
        const model = getSettingsModel()
        if (model) {
            try {
              await model.upsert({
                where: { id: "singleton" },
                update: { lastBackupAt: new Date() },
                create: { id: "singleton", lastBackupAt: new Date(), backupCount: DEFAULT_RETENTION }
              })
            } catch (e) {
              console.warn("[Backup] Could not update lastBackupAt record")
            }
        }
        
        resolve({ fileName, filePath })
      } catch (err) {
        console.error(`[Backup] Finalization error:`, err)
        reject(err)
      }
    })

    archive.on("error", (err) => {
      console.error(`[Backup] Archiver error:`, err)
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath)
      reject(err)
    })
    archive.pipe(output)

    const dataStream = Readable.from(JSON.stringify(data, null, 2))
    archive.append(dataStream, { name: "data.json" })
    
    archive.finalize()
  })
}

export async function restoreBackup(filePath: string) {
  console.log(`[Backup] Restoring from ${filePath}`)
  const directory = await unzipper.Open.file(filePath)
  const file = directory.files.find(f => f.path === "data.json")

  if (!file) {
    throw new Error("Invalid backup: data.json not found")
  }

  const content = await file.buffer()
  const data = JSON.parse(content.toString())

  return await prisma.$transaction(async (tx: any) => {
    await tx.submission.deleteMany()
    await tx.result.deleteMany()
    await tx.task.deleteMany()
    await tx.olympiad.deleteMany()
    await tx.account.deleteMany()
    await tx.session.deleteMany()
    await tx.verificationToken.deleteMany()
    await tx.user.deleteMany()
    
    const settingsModel = getSettingsModel(tx)
    if (settingsModel) await settingsModel.deleteMany()

    if (data.users.length) await tx.user.createMany({ data: data.users })
    if (data.accounts.length) await tx.account.createMany({ data: data.accounts })
    if (data.sessions.length) await tx.session.createMany({ data: data.sessions })
    if (data.verificationTokens.length) await tx.verificationToken.createMany({ data: data.verificationTokens })
    if (data.olympiads.length) await tx.olympiad.createMany({ data: data.olympiads })
    if (data.tasks.length) await tx.task.createMany({ data: data.tasks })
    if (data.submissions.length) await tx.submission.createMany({ data: data.submissions })
    if (data.results.length) await tx.result.createMany({ data: data.results })
    
    if (data.globalSettings && data.globalSettings.length && settingsModel) {
        await settingsModel.createMany({ data: data.globalSettings })
    }

    return { success: true }
  }, { timeout: 60000 })
}

export async function getBackupsList() {
  if (!fs.existsSync(BACKUP_DIR)) return []
  
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.endsWith(".zip") && !f.endsWith(".tmp"))
    .map(f => {
      try {
        const stats = fs.statSync(path.join(BACKUP_DIR, f))
        return {
          name: f,
          size: stats.size,
          createdAt: stats.mtime
        }
      } catch (e) {
        return null
      }
    })
    .filter((f): f is { name: string, size: number, createdAt: Date } => f !== null)
    .sort((a, b) => {
      const timeDiff = b.createdAt.getTime() - a.createdAt.getTime()
      if (timeDiff !== 0) return timeDiff
      return b.name.localeCompare(a.name)
    })

  return files
}

export async function cleanOldBackups() {
  try {
    const model = getSettingsModel()
    if (!model) {
        console.warn("[BackupRetention] Settings model missing, skipping cleanup...")
        return
    }

    let settings = await model.findFirst() || await model.findUnique({ where: { id: "singleton" } })
    
    if (!settings) {
        console.warn("[BackupRetention] Settings missing, initializing defaults...")
        settings = await model.create({
            data: { id: "singleton", backupCount: DEFAULT_RETENTION }
        })
    }
    
    let count = settings?.backupCount ?? DEFAULT_RETENTION
    if (count > MAX_PHYSICAL_LIMIT) count = MAX_PHYSICAL_LIMIT
    if (count < 1) count = 1
    
    const files = await getBackupsList()
    
    if (files.length > count) {
      const toDelete = files.slice(count)
      console.log(`[BackupRetention] Cleaning ${toDelete.length} old backups. Limit: ${count}`)
      for (const file of toDelete) {
          const filePath = path.join(BACKUP_DIR, file.name)
          if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath)
          }
      }
    }
  } catch (e) {
    console.error("[Backup] Retention logic failed:", e)
  }
}

export function getBackupPath(fileName: string) {
    const safeName = path.basename(fileName)
    return path.join(BACKUP_DIR, safeName)
}
