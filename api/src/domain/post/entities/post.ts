import { Entity } from '@/domain/shared/entity';
import { Result } from '@/domain/shared/result';
import { PostContent } from '../value-objects/post-content';
import { randomUUID } from 'crypto';

export interface PostProps {
    id: string,
    content: PostContent,
    authorId: string, 
    createdAt: Date,
    updatedAt: Date | null,
}

export class Post extends Entity<PostProps> {
    //why constructor is private: The constructor of the Post class is private to enforce the 
    // use of the static create method for creating instances of the Post class.

  private constructor(props: PostProps) {
    //why super: The super(props) call is necessary because the Post class extends the Entity class, which 
    // has a constructor that takes props as an argument. 
    // By calling super(props), we are passing the props to the Entity constructor, 
    // which will initialize the props property of the Entity class. 
    // This allows us to use the props in the Post class and also ensures that any 
    // functionality defined in the Entity class is properly initialized for instances of the Post class.
    super(props);
  }

  //public static creates a new instance of the Post class. It takes an object with the properties 
  // needed to create a Post,

  public static create(props: {
    id?: string,
    content: PostContent,
    authorId: string,
    createdAt?: Date,
    deletedAt?: Date | null,
    updatedAt?: Date | null,
  }): Result<Post> {
    const now = new Date();

    const contentResult = PostContent.create(props.content.value);
    if (contentResult.isFailure) {
        return Result.fail(contentResult.error);

    }
    
    const post = new Post({
      id: props.id ?? randomUUID(),
      content: props.content,
      authorId: props.authorId,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? null,

    });


    return Result.ok(post);
  }
  // instance method — 'this' is the existing post
  // public — use cases need to call this
  public edit(newContent: PostContent): void {
    this.props.content = newContent
    this.props.updatedAt = new Date()
  }

  // instance method — 'this' is the existing post
  // public — use cases need to call this
  public delete(): void {
  }


    get id(): string {
        return this.props.id;
    }

    get content(): PostContent {
        return this.props.content;
    }

    get authorId(): string {
        return this.props.authorId;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date | null {
        return this.props.updatedAt;
    }       


}
