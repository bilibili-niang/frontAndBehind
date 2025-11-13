# 角色管理

本文档描述角色的增删改查与权限分配相关接口。

> 占位文档：后续将补充请求参数、响应示例与错误码。

## 接口概览

- 获取角色列表：`GET /roles`
- 创建角色：`POST /roles`
- 更新角色：`PUT /roles/:id`
- 删除角色：`DELETE /roles/:id`
- 分配权限：`POST /roles/:id/permissions`