interface Pagination{
    totalCount: number,
    totalPages: number
}

export default interface Response<T>{
    error?: string,
    data?: T,
    pagination?: Pagination
}