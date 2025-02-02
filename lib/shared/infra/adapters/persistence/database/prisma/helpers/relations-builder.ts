/**
 * Helper para construir o objeto de inclusão de relações para consultas do Prisma.
 *
 * @param relations Array de strings representando as relações a serem incluídas.
 * @returns Objeto formatado para o include do Prisma.
 */
export function prismaRelationsBuilder(relations?: string[]): any {
  if (!relations || relations.length === 0) {
    return undefined;
  }

  const include: any = {};

  relations.forEach((relation) => {
    const levels = relation.split('_');
    let currentLevel = include;

    levels.forEach((level, index) => {
      if (!currentLevel[level]) {
        // Inicializa o nível atual como um objeto vazio
        currentLevel[level] =
          index === levels.length - 1 ? true : { include: {} };
      } else if (currentLevel[level] === true) {
        // Se o nível atual já for um booleano, transforma-o em um objeto para incluir sub-relations
        currentLevel[level] = { include: {} };
      }

      // Move para o próximo nível, mas somente se não for o último
      if (index < levels.length - 1) {
        currentLevel = currentLevel[level].include;
      }
    });
  });

  return include;
}
