import ru from './dictionaries/ru.json';

type Dictionary = typeof ru;

const dictionaries: Record<string, Dictionary> = {
  ru,
};


export const getDictionary = (locale: string = 'ru') => {
  return dictionaries[locale] || dictionaries['ru'];
};
