import { Exclude, Expose } from 'class-transformer';

export class StandardApiResponse<T> {
  @Expose({ name: 'data' })
  data?: T;

  @Expose({ name: 'errors' })
  errors?: ApiError[];

  @Expose({ name: 'links' })
  links?: Record<string, string>;

  @Expose({ name: 'meta' })
  meta?: Record<string, any>;

  @Expose({name: 'statusCode'})
    statusCode?: number;

  private constructor(init?: Partial<StandardApiResponse<T>>) {
    Object.assign(this, init);
  }

  static success<T>(
    data: T,
    links?: Record<string, string>,
    meta?: Record<string, any>,
  ): StandardApiResponse<T> {
    return new StandardApiResponse<T>({ data, links, meta });
  }

  static fail<T = unknown>(errors: ApiError[]): StandardApiResponse<T> {
    return new StandardApiResponse<T>({ errors });
  }
}

export class JsonApiResource<TAttributes> {
  @Expose()
  type!: string;

  @Expose()
  id!: string;

  @Expose()
  attributes!: TAttributes;

  constructor(init: { type: string; id: string; attributes: TAttributes }) {
    Object.assign(this, init);
  }
}

export class ApiError {
  @Expose()
  status!: string; 

  @Expose()
  title!: string;  

  @Expose()
  detail?: string; 

  constructor(init: { status: string; title: string; detail?: string }) {
    Object.assign(this, init);
  }
}
