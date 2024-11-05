import {
    queryGeneration,
    queryGenerationByIds,
    queryGenerationByNum,
    queryGenerationByUser,
    queryGenerationCount,
} from "@/models/generation";
import to from "await-to-js";

export async function getHomeGallery(
    ids: string[]
) {
    console.log("getHomeGallery ids:", ids);
    
    const [listErr, generationList] = await to(
        queryGenerationByIds({
            ids
        })
    );

    if (listErr) {
        console.error("getHomeGallery error:", listErr.message);
        return {
            generationList: [],
        };
    }

    console.log("getHomeGallery result:", generationList);

    return {
        generationList: generationList || [],
    };
}

export async function getGenerationList(
    pageNo: number = 1,
    pageSize: number = 48
) {
    pageNo = pageNo - 1 < 0 ? 0 : pageNo - 1;
    const offset = pageNo * pageSize;
    const [listErr, generationList] = await to(
        queryGenerationByNum({
            offset,
            pageSize,
        })
    );
    const [countErr, count] = await to(queryGenerationCount());

    if (listErr) {
        console.error("getGenerationList error:", listErr.message);
        return {
            generationList: [],
            pageNo: pageNo,
            total: 0,
            pageSize,
        };
    }

    if (countErr) {
        console.error("getGenerationCount error:", countErr.message);
        return {
            generationList: generationList || [],
            pageNo: pageNo,
            total: 0,
            pageSize,
        };
    }

    const total = Math.ceil((count || 0) / pageSize);
    console.info("Generation list stats:", { offset, pageSize, count: generationList?.length || 0 });

    return {
        generationList: generationList || [],
        pageNo: pageNo,
        total,
        pageSize,
    };
}

export async function getUserGenertedList(
    pageNo: number = 1,
    pageSize: number = 48,
    userId: string
) {
    pageNo = pageNo - 1 < 0 ? 0 : pageNo - 1;
    const offset = pageNo * pageSize;
    const [listErr, generationList] = await to(
        queryGenerationByUser({
            offset,
            pageSize,
            userId,
        })
    );
    const [countErr, count] = await to(
        queryGenerationCount({
            userId,
        })
    );

    if (listErr) {
        console.error("getUserGeneratedList error:", listErr.message);
        return {
            generationList: [],
            pageNo: pageNo,
            total: 0,
            pageSize,
        };
    }

    if (countErr) {
        console.error("getUserGenerationCount error:", countErr.message);
        return {
            generationList: generationList || [],
            pageNo: pageNo,
            total: 0,
            pageSize,
        };
    }

    const total = Math.ceil((count || 0) / pageSize);
    console.info("User generation list stats:", { offset, pageSize, count: generationList?.length || 0 });

    return {
        generationList: generationList || [],
        pageNo: pageNo,
        total,
        pageSize,
    };
}

export async function getGenerationItem(generationId: string) {
    const [generationErr, generation] = await to(
        queryGeneration({
            id: generationId,
        })
    );

    if (generationErr) {
        console.error("getGenerationItem error:", generationErr);
        return Promise.reject(generationErr);
    }

    if (!generation.id) {
        return Promise.reject(new Error("Not Found Flux Image Result."));
    }

    console.info("Generation item:", generation);

    // Используем imgUrl вместо generation для URL изображения
    return Promise.resolve({ ...generation, url: generation.imgUrl });
}
