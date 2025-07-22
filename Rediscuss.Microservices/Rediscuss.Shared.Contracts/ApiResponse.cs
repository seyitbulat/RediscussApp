using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Rediscuss.Shared.Contracts
{
    public class ApiResponse<T>
    {
        public T? Data { get; set; }

        [JsonIgnore]
        public int StatusCode { get; set; }


        public List<string> Errors { get; set; }


        public static ApiResponse<T> Success(T data, int statusCode)
        {
            return new ApiResponse<T> { Data = data, StatusCode = statusCode };
        }

        public static ApiResponse<T> Success(int statusCode)
        {
            return new ApiResponse<T> {Data = default(T) ,StatusCode = statusCode };
        }

        public static ApiResponse<T> Fail(List<string> errors, int statusCode)
        {
            return new ApiResponse<T> { Errors = errors, StatusCode = statusCode };
        }

        public static ApiResponse<T> Fail(string error, int statusCode)
        {
            return new ApiResponse<T> { Errors = new List<string> { error }, StatusCode = statusCode };
        }
    }
}
