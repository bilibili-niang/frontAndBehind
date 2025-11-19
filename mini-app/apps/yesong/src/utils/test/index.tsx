const randImgIndex = (n=120) => Math.floor(Math.random() * n) + 1

export const buildImgUrl = (n?: number) => `${process.env.TARO_APP_REQUEST_BASE_URL}/${(n ?? randImgIndex())}.png`
export const buildCoffeeImgUrl = (n?: number) => `${process.env.TARO_APP_REQUEST_BASE_URL}/coffee/${(n ?? randImgIndex(6))}.png`
