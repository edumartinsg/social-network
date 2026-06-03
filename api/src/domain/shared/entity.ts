export abstract class Entity<T> {
  protected readonly props: T;
  protected constructor(props: T) {
    this.props = props;
  }

  equals(object?: Entity<T>): boolean {
    if (!object) return false;
    return (this as any).id.value === (object as any).id.value;
  }
}
