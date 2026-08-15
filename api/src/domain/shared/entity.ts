// RECONSTRUCTED: base Entity class, referenced constantly throughout
// the conversation but the exact file was never pasted. This reflects
// the usage pattern observed (protected props, constructor(props)).
// Verify against your original if you still have it anywhere (e.g.
// an old terminal history, IDE local history, or a previous commit
// message diff on GitHub).
export abstract class Entity<T> {
  protected props: T

  constructor(props: T) {
    this.props = props
  }
}
