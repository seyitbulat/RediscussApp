import { JsonApiResource } from "./api-response.dto";


export class ControllerResponseDto<T>{
    data: JsonApiResource<T> | JsonApiResource<T>[];
    links?: Record<string, string>;
    meta?: Record<string, any>;

    constructor(data: JsonApiResource<T> | JsonApiResource<T>[], links?: Record<string, string>, meta?: Record<string, any>){
        this.data = data;
        this.links = links;
        this.meta = meta;
    }

}