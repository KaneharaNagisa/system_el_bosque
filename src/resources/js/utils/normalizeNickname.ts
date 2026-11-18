export const normalizeNicknameInput = (nickname: string): string =>
    nickname
        .replace(/[Ａ-Ｚａ-ｚ]/g, (character) =>
            String.fromCharCode(character.charCodeAt(0) - 0xfee0),
        )
        .replace(/[a-z]/g, (character) => character.toUpperCase())
        .replace(/[\uFF61-\uFF9F]+/g, (characters) =>
            characters.normalize("NFKC"),
        );
