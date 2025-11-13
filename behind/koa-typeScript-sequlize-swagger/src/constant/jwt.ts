// 优先读取环境变量 JWT_SECRET；未配置时回退到本地默认值
export const salt = process.env.JWT_SECRET || 'secret'
// 允许通过环境变量配置 token 过期时间，默认 48h
export const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '48h'