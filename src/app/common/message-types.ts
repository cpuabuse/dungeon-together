/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Message type definition
 */

import * as typing from "io-ts";
import { MessageTypeWord, MovementWord } from "./defaults/connection";

/**
 * Message type descriptions.
 *
 * Notes:
 *
 * 1. To extract TypeScript types, we need to use `typeof`, which cannot be used on the values of the map, thus object is preferred.
 * 1. Classes are not use, since as of now it is impossible to implement type predicates on class members.
 * 1. Even though for string literal union (within body) keyof is recommended in {@link https://github.com/gcanti/io-ts/blob/master/index.md#union-of-string-literals | io-ts documentation}, ignoring it to preserve meaning. {@link https://github.com/microsoft/TypeScript/issues/31268 | Pull request} should introduce enums instead.
 * 1. As of now, there is no clean way ({@link https://github.com/microsoft/TypeScript/issues/13298 | #13298}) to dynamically define tuple type, which typing library consumes to guarantee uniqueness and exhaustiveness. Thus, instead of using implicit type constraints during source structure initialization, as an immediate and cleaner solution, `type` discriminator exhaustiveness constraint is to be done in the resulting final exported type; And `type` discriminator uniqueness is to be manually checked by developers (in source structure initialization).
 */
// Infer generic type
// eslint-disable-next-line @typescript-eslint/typedef
export const messageType = typing.union([
	typing.type({
		body: typing.null,
		type: typing.literal(MessageTypeWord.Empty)
	}),
	typing.type({
		body: typing.null,
		type: typing.literal(MessageTypeWord.Sync)
	}),
	typing.type({
		body: typing.type({
			direction: typing.union([
				typing.literal(MovementWord.Up),
				typing.literal(MovementWord.Down),
				typing.literal(MovementWord.Left),
				typing.literal(MovementWord.Right),
				typing.literal(MovementWord.ZUp),
				typing.literal(MovementWord.ZDown)
			])
		}),
		type: typing.literal(MessageTypeWord.Movement)
	}),
	typing.type({
		body: typing.null,
		type: typing.literal(MessageTypeWord.Update)
	})
]);

/**
 * Exhaustive (for {@link MessageTypeWord}) message union.
 *
 * If exhaustive check fails, is {@link unknown}, so that properties cannot be accessed.
 */
export type Message<W extends MessageTypeWord = MessageTypeWord> = {
	/**
	 * Message body.
	 */
	body: any;

	/**
	 * Message type.
	 */
	type: MessageTypeWord;
} extends typing.TypeOf<typeof messageType>
	? typing.TypeOf<typeof messageType> & {
			/**
			 * Message type received in argument.
			 */
			type: W;
	  }
	: unknown;
