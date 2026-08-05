import { Result } from "@/domain/shared/result"

export class MediaType {
    private constructor(private readonly mediaType: 'image' | 'video' | 'article') {}

    public static create(mediaType: string): Result<MediaType> {
        const validMediaTypes = ['image', 'video', 'article'];
        if (!validMediaTypes.includes(mediaType as any)) {
            return Result.fail('Invalid media type')
        }   
        return Result.ok(new MediaType(mediaType as any))
     }
     get value(): 'image' | 'video' | 'article' {
        return this.mediaType
     }
}
