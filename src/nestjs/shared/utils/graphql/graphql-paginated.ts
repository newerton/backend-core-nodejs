import { Type } from '@nestjs/common';
import { Field, Int, ObjectType } from '@nestjs/graphql';

export function Paginated<TItem>(TItemClass: Type<TItem>) {
  @ObjectType(`${TItemClass.name}Edge`)
  abstract class EdgeType {
    @Field(() => [TItemClass], { nullable: true })
    data: [TItem];

    @Field(() => Int)
    count: number;

    @Field(() => Int)
    page: number;

    @Field(() => Int)
    limit: number;
  }
  return EdgeType;
}
