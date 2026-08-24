// RECONSTRUCTED: base ValueObject class, referenced but never pasted
// in full. Most of your actual Value Objects (email, password, etc.)
// do not extend this and instead implement the pattern directly with
// a private constructor + static create(). Kept here for completeness
// in case anything in your codebase does extend it.
export abstract class ValueObject<T> {
  protected props: T

  constructor(props: T) {
    this.props = props
  }

  public equals(vo?: ValueObject<T>): boolean {
    if (vo === null || vo === undefined) return false
    return JSON.stringify(this.props) === JSON.stringify(vo.props)
  }
}
