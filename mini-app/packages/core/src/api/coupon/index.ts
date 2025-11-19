
export interface ResponseData<T> {
  code: number;
  success: boolean;
  data: T;
  msg?: string;
}

