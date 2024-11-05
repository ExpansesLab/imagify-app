import prisma from "../lib/prisma";

export async function insertGeneration(data: any) {
    // 提交数据库
    const result = await prisma.generation.create({ data });

    return result;
}

export async function updateGeneration(id: string, data: any) {
    // 提交数据库
    const generation = await prisma.generation.update({
        where: {
            id,
        },
        data,
    });

    return generation;
}

export async function queryGeneration({ id }: any) {
    // 提交数据库
    const generation =
        (await prisma.generation.findUnique({
            where: {
                id,
            },
        })) || {};

    return generation;
}

export async function queryGenerationByIds({ ids }: { ids: string[] }) {
    const params = {
        orderBy: {
            createdAt: "desc",
        },
        where: {
            AND: [
                { imgUrl: { not: null } },
                { imgUrl: { not: "" } },
                { id: { in: ids } }
            ]
        },
    };
    const result = await prisma.generation.findMany(params);

    return result;
}

export async function queryGenerationByNum({ offset, pageSize }: any) {
    const params = {
        skip: offset,
        take: pageSize,
        orderBy: {
            createdAt: "desc",
        },
        where: {
            AND: [
                { imgUrl: { not: null } },
                { imgUrl: { not: "" } }
            ]
        },
    };
    const result = await prisma.generation.findMany(params);

    return result;
}

export async function queryGenerationByUser({ offset, pageSize, userId }: any) {
    const params = {
        skip: offset,
        take: pageSize,
        orderBy: {
            createdAt: "desc",
        },
        where: {
            AND: [
                { imgUrl: { not: null } },
                { imgUrl: { not: "" } },
                { userId }
            ]
        },
    };

    const result = await prisma.generation.findMany(params);

    return result;
}

export async function queryGenerationCount(where?: any) {
    const baseWhere = {
        AND: [
            { imgUrl: { not: null } },
            { imgUrl: { not: "" } }
        ]
    };

    const params = where
        ? {
              where: {
                  AND: [...baseWhere.AND, where]
              },
          }
        : {
              where: baseWhere
          };
    const result = await prisma.generation.count(params);

    return result;
}
