export interface IMovie {
  id: string;
  name: string;
  year: number;
  type: string;
  image: {
    src: string;
    width: number;
    height: number;
  };
  starring: string;
  similarity: number;
}

export interface IImdbMovieInfo {
  match?: string;
  meta: IImdbMovieMeta;
}

export interface IImdbMovieMeta {
  id?: string;
  name?: string;
  year?: number;
  type?: string;
  yearRange?: string | undefined;
  image: { src: string; width: number; height: number };
  starring: string;
  similarity: number;
}

export interface IOpenAiMovie {
  name: string;
  year?: string;
}
