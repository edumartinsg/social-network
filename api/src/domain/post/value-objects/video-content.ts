import { Result } from "@/domain/shared/result"
import { get } from "https"

export class VideoContent {
  private constructor(
    private readonly _url: string,
    private readonly _durationSeconds: number
  ) {}

  public static create(url: string, durationSeconds: number): Result<VideoContent> {
    if (!url || url.trim().length === 0) {
      return Result.fail('Video URL is required')
    }
    if (!/^https?:\/\/.+/.test(url)) {
      return Result.fail('Video URL must be a valid URL')
    }
    if (durationSeconds <= 0) {
      return Result.fail('Duration must be greater than 0')
    }
    if (durationSeconds > 600) {
      return Result.fail('Video cannot exceed 10 minutes')
    }
    return Result.ok(new VideoContent(url, durationSeconds))
  }

  get url(): string { return this._url }
  get durationSeconds(): number { return this._durationSeconds }
}