---
title: 权限管理 API
---

# 权限管理 API

用于管理角色与权限分配（角色、菜单、按钮权限等）。

## 接口示例

```http
GET /api/roles
POST /api/roles
PUT /api/roles/:id
DELETE /api/roles/:id
```

## 说明

- 角色与权限的关系以后端定义为准。
- 前端路由与菜单权限请参考《认证与登录》《路由生成与配置》。

> 后续将补充权限模型、字段说明及常见场景。