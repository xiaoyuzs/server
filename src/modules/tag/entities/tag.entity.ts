import {Article} from 'src/modules/article/entities/article.entity';
import {User} from '../../../core/user/entities/user.entity';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToMany,
    DeleteDateColumn,
    Index,
    ManyToOne,
} from 'typeorm';

@Entity()
export class Tag {
    @PrimaryGeneratedColumn()
    id?: string;

    @Column()
    @Index({unique: true})
    content: string;

    @Column({default: false})
    is_topics: boolean;

    @ManyToMany(() => Article, (article) => article.tags)
    articles: Article[];

    @DeleteDateColumn()
    deleteTime: Date;

    @ManyToOne(() => User, (user) => user.id)
    user: User;
}
