export interface JsonApiResource<TAttributes> {
    type: string;
    attributes: TAttributes;
    id: string
}


export interface ApiError {
    status: string;
    title: string;
    detail?: string
}


export interface StandardApiResponse<T> {
    data?: T;
    errors?: ApiError[];
    meta?: Record<string, any>;
    links?: Record<string, any>
}