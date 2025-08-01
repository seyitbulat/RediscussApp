using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Rediscuss.Shared.Contracts
{
	public class StandardApiResponse<T>
	{
		[JsonPropertyName("data")]
		[JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
		public T Data { get; set; }

		[JsonPropertyName("errors")]
		[JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
		public List<ApiError>? Errors { get; set; }

		[JsonPropertyName("links")]
		[JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public Dictionary<string, string>? Links { get; set; }


		[JsonPropertyName("meta")]
		[JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
		public Dictionary<string, object>? Meta { get; set; }


		public static StandardApiResponse<T> Success(T data, Dictionary<string, string>? links = null, Dictionary<string, object>? meta = null) => new() { Data = data, Links = links, Meta = meta };

		public static StandardApiResponse<T> Fail(List<ApiError> errors) => new() { Errors = errors };
    }


	public class JsonApiResource<TAttributes>
	{
		[JsonPropertyName("type")]
        public string Type { get; set; }

        [JsonPropertyName("id")]
        public string Id { get; set; }

		[JsonPropertyName("attributes")]
        public TAttributes Attributes { get; set; }
    }

	public class ApiError
	{
		[JsonPropertyName("status")]
		public string Status { get; set; }

		[JsonPropertyName("title")]
		public string Title { get; set; }

		[JsonPropertyName("detail")]
		[JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
		public string Detail { get; set; }
	}
}
