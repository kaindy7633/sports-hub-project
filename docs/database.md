# SportsHub 数据库设计文档

## 系统配置模块

### 系统管理员表 (managers)

| 字段名 | 类型 | 长度 | 允许空 | 默认值 | 主键 | 说明 |
|--------|------|------|--------|--------|------|------|
| id | bigint | - | 否 | - | 是 | ID |
| manager_id | bigint | - | 否 | - | 是 | 管理员ID |
| username | varchar | 50 | 否 | - | - | 用户名 |
| password | varchar | 255 | 否 | - | - | 密码（加密存储） |
| salt | varchar | 32 | 否 | - | - | 密码加密盐值 |
| parent_id | bigint | - | 否 | 0 | - | 父管理员ID，0表示超级管理员 |
| nick_name | varchar | 50 | 是 | null | - | 昵称 |
| real_name | varchar | 50 | 是 | null | - | 真实姓名 |
| avatar | varchar | 255 | 是 | null | - | 头像URL |
| email | varchar | 100 | 是 | null | - | 电子邮箱 |
| phone | varchar | 20 | 是 | null | - | 手机号码 |
| status | smallint | - | 否 | 1 | - | 状态：0-禁用，1-正常 |
| created_at | timestamp | - | 否 | CURRENT_TIMESTAMP | - | 创建时间 |
| updated_at | timestamp | - | 否 | CURRENT_TIMESTAMP | - | 更新时间 |
| deleted_at | timestamp | - | 是 | null | - | 删除时间 |

### 系统参数表 (sys_configs)

| 字段名 | 类型 | 长度 | 允许空 | 默认值 | 主键 | 说明 |
|--------|------|------|--------|--------|------|------|
| id | bigint | - | 否 | - | 是 | 参数ID |
| param_key | varchar | 50 | 否 | - | - | 参数键名 |
| param_value | varchar | 255 | 否 | - | - | 参数键值 |
| param_type | varchar | 20 | 否 | - | - | 参数类型：string/number/boolean/json |
| description | varchar | 255 | 是 | null | - | 参数描述 |
| status | smallint | - | 否 | 1 | - | 状态：0-禁用，1-正常 |
| created_at | timestamp | - | 否 | CURRENT_TIMESTAMP | - | 创建时间 |
| updated_at | timestamp | - | 否 | CURRENT_TIMESTAMP | - | 更新时间 |
| deleted_at | timestamp | - | 是 | null | - | 删除时间 |

### 系统字典表 (sys_dict_types)

| 字段名 | 类型 | 长度 | 允许空 | 默认值 | 主键 | 说明 |
|--------|------|------|--------|--------|------|------|
| id | bigint | - | 否 | - | 是 | 字典类型ID |
| dict_name | varchar | 50 | 否 | - | - | 字典名称 |
| dict_type | varchar | 50 | 否 | - | - | 字典类型 |
| status | smallint | - | 否 | 1 | - | 状态：0-禁用，1-正常 |
| remark | varchar | 255 | 是 | null | - | 备注 |
| created_at | timestamp | - | 否 | CURRENT_TIMESTAMP | - | 创建时间 |
| updated_at | timestamp | - | 否 | CURRENT_TIMESTAMP | - | 更新时间 |
| deleted_at | timestamp | - | 是 | null | - | 删除时间 |

### 系统字典数据表 (sys_dict_data)

| 字段名 | 类型 | 长度 | 允许空 | 默认值 | 主键 | 说明 |
|--------|------|------|--------|--------|------|------|
| id | bigint | - | 否 | - | 是 | 字典数据ID |
| dict_type_id | bigint | - | 否 | - | - | 字典类型ID |
| dict_label | varchar | 100 | 否 | - | - | 字典标签 |
| dict_value | varchar | 100 | 否 | - | - | 字典键值 |
| dict_sort | int | - | 否 | 0 | - | 字典排序 |
| status | smallint | - | 否 | 1 | - | 状态：0-禁用，1-正常 |
| remark | varchar | 255 | 是 | null | - | 备注 |
| created_at | timestamp | - | 否 | CURRENT_TIMESTAMP | - | 创建时间 |
| updated_at | timestamp | - | 否 | CURRENT_TIMESTAMP | - | 更新时间 |
| deleted_at | timestamp | - | 是 | null | - | 删除时间 |

## 用户模块

### 用户基本信息表 (users)

| 字段名 | 类型 | 长度 | 允许空 | 默认值 | 主键 | 说明 |
|--------|------|------|--------|--------|------|------|
| id | bigint | - | 否 | - | 是 | 用户ID |
| user_id | bigint | - | 否 | - | - | 业务用户ID |
| username | varchar | 50 | 否 | - | - | 用户名 |
| password | varchar | 255 | 否 | - | - | 密码（加密存储） |
| salt | varchar | 32 | 否 | - | - | 密码加密盐值 |
| nick_name | varchar | 50 | 是 | null | - | 昵称 |
| real_name | varchar | 50 | 是 | null | - | 真实姓名 |
| id_card | varchar | 18 | 是 | null | - | 身份证号码 |
| avatar | varchar | 255 | 是 | null | - | 头像URL |
| email | varchar | 100 | 是 | null | - | 电子邮箱 |
| phone | varchar | 20 | 是 | null | - | 手机号码 |
| emergency_contact | varchar | 20 | 是 | null | - | 紧急联系人电话 |
| address | varchar | 255 | 是 | null | - | 住址 |
| gender | smallint | - | 是 | null | - | 性别：0-未知，1-男，2-女 |
| birthday | date | - | 是 | null | - | 出生日期 |
| status | smallint | - | 否 | 1 | - | 状态：0-禁用，1-正常 |
| created_at | timestamp | - | 否 | CURRENT_TIMESTAMP | - | 创建时间 |
| updated_at | timestamp | - | 否 | CURRENT_TIMESTAMP | - | 更新时间 |
| deleted_at | timestamp | - | 是 | null | - | 删除时间 |

### 用户认证表 (user_auths)

| 字段名 | 类型 | 长度 | 允许空 | 默认值 | 主键 | 说明 |
|--------|------|------|--------|--------|------|------|
| id | bigint | - | 否 | - | 是 | 认证ID |
| user_id | bigint | - | 否 | - | - | 关联用户ID |
| identity_type | varchar | 20 | 否 | - | - | 认证类型：password/email/phone/wechat/weibo |
| identifier | varchar | 100 | 否 | - | - | 认证标识（用户名/手机号/邮箱/第三方应用的唯一标识） |
| credential | varchar | 255 | 否 | - | - | 凭证（密码/验证码/token） |
| created_at | timestamp | - | 否 | CURRENT_TIMESTAMP | - | 创建时间 |
| updated_at | timestamp | - | 否 | CURRENT_TIMESTAMP | - | 更新时间 |
| deleted_at | timestamp | - | 是 | null | - | 删除时间 |

### 用户角色表 (roles)

| 字段名 | 类型 | 长度 | 允许空 | 默认值 | 主键 | 说明 |
|--------|------|------|--------|--------|------|------|
| id | bigint | - | 否 | - | 是 | ID |
| role_id | bigint | - | 否 | - | 是 | 角色ID |
| name | varchar | 50 | 否 | - | - | 角色名称 |
| code | varchar | 50 | 否 | - | - | 角色编码 |
| description | varchar | 255 | 是 | null | - | 角色描述 |
| status | smallint | - | 否 | 1 | - | 状态：0-禁用，1-正常 |
| created_at | timestamp | - | 否 | CURRENT_TIMESTAMP | - | 创建时间 |
| updated_at | timestamp | - | 否 | CURRENT_TIMESTAMP | - | 更新时间 |
| deleted_at | timestamp | - | 是 | null | - | 删除时间 |

### 用户角色关联表 (user_roles)

| 字段名 | 类型 | 长度 | 允许空 | 默认值 | 主键 | 说明 |
|--------|------|------|--------|--------|------|------|
| user_id | bigint | - | 否 | - | 是 | 用户ID |
| role_id | bigint | - | 否 | - | 是 | 角色ID |
| created_at | timestamp | - | 否 | CURRENT_TIMESTAMP | - | 创建时间 |

## 业务模块

### 活动类型表 (activity_types)

| 字段名 | 类型 | 长度 | 允许空 | 默认值 | 主键 | 说明 |
|--------|------|------|--------|--------|------|------|
| id | bigint | - | 否 | - | 是 | 活动类型ID |
| name | varchar | 50 | 否 | - | - | 活动类型名称 |
| code | varchar | 50 | 否 | - | - | 活动类型编码 |
| icon | varchar | 255 | 是 | null | - | 活动类型图标 |
| description | varchar | 255 | 是 | null | - | 活动类型描述 |
| status | smallint | - | 否 | 1 | - | 状态：0-禁用，1-正常 |
| created_at | timestamp | - | 否 | CURRENT_TIMESTAMP | - | 创建时间 |
| updated_at | timestamp | - | 否 | CURRENT_TIMESTAMP | - | 更新时间 |
| deleted_at | timestamp | - | 是 | null | - | 删除时间 |

### 活动表 (activities)

| 字段名 | 类型 | 长度 | 允许空 | 默认值 | 主键 | 说明 |
|--------|------|------|--------|--------|------|------|
| id | bigint | - | 否 | - | 是 | 活动ID |
| activity_id | bigint | - | 否 | - | - | 业务活动ID |
| title | varchar | 100 | 否 | - | - | 活动标题 |
| type_id | bigint | - | 否 | - | - | 活动类型ID |
| venue_id | bigint | - | 否 | - | - | 场地ID |
| creator_id | bigint | - | 否 | - | - | 创建者ID |
| team_id | bigint | - | 是 | null | - | 关联团队ID |
| description | text | - | 是 | null | - | 活动描述 |
| start_time | timestamp | - | 否 | - | - | 开始时间 |
| end_time | timestamp | - | 否 | - | - | 结束时间 |
| max_participants | int | - | 否 | 0 | - | 最大参与人数，0表示不限制 |
| current_participants | int | - | 否 | 0 | - | 当前参与人数 |
| fee | decimal | 10,2 | 否 | 0.00 | - | 参与费用 |
| status | smallint | - | 否 | 0 | - | 状态：0-草稿，1-已发布，2-未开始，3-进行中，4-已结束 |
| created_at | timestamp | - | 否 | CURRENT_TIMESTAMP | - | 创建时间 |
| updated_at | timestamp | - | 否 | CURRENT_TIMESTAMP | - | 更新时间 |
| deleted_at | timestamp | - | 是 | null | - | 删除时间 |

### 场所表 (venues)

| 字段名 | 类型 | 长度 | 允许空 | 默认值 | 主键 | 说明 |
|--------|------|------|--------|--------|------|------|
| id | bigint | - | 否 | - | 是 | 场地ID |
| venue_id | bigint | - | 否 | - | - | 业务场地ID |
| name | varchar | 100 | 否 | - | - | 场地名称 |
| address | varchar | 255 | 否 | - | - | 场地地址 |
| contact_phone | varchar | 20 | 否 | - | - | 联系电话 |
| business_hours | varchar | 100 | 是 | null | - | 营业时间 |
| facilities | text | - | 是 | null | - | 场地设施描述 |
| images | text | - | 是 | null | - | 场地图片，JSON数组 |
| status | smallint | - | 否 | 1 | - | 状态：0-禁用，1-正常 |
| created_at | timestamp | - | 否 | CURRENT_TIMESTAMP | - | 创建时间 |
| updated_at | timestamp | - | 否 | CURRENT_TIMESTAMP | - | 更新时间 |
| deleted_at | timestamp | - | 是 | null | - | 删除时间 |

### 团队表 (teams)

| 字段名 | 类型 | 长度 | 允许空 | 默认值 | 主键 | 说明 |
|--------|------|------|--------|--------|------|------|
| id | bigint | - | 否 | - | 是 | 团队ID |
| team_id | bigint | - | 否 | - | - | 业务团队ID |
| name | varchar | 100 | 否 | - | - | 团队名称 |
| logo | varchar | 255 | 是 | null | - | 团队logo |
| description | text | - | 是 | null | - | 团队描述 |
| leader_id | bigint | - | 否 | - | - | 队长ID |
| max_members | int | - | 否 | 0 | - | 最大成员数，0表示不限制 |
| current_members | int | - | 否 | 0 | - | 当前成员数 |
| status | smallint | - | 否 | 1 | - | 状态：0-解散，1-正常 |
| created_at | timestamp | - | 否 | CURRENT_TIMESTAMP | - | 创建时间 |
| updated_at | timestamp | - | 否 | CURRENT_TIMESTAMP | - | 更新时间 |
| deleted_at | timestamp | - | 是 | null | - | 删除时间 |

### 消息表 (messages)

| 字段名 | 类型 | 长度 | 允许空 | 默认值 | 主键 | 说明 |
|--------|------|------|--------|--------|------|------|
| id | bigint | - | 否 | - | 是 | 消息ID |
| message_id | bigint | - | 否 | - | - | 业务消息ID |
| sender_id | bigint | - | 否 | - | - | 发送者ID |
| receiver_id | bigint | - | 否 | - | - | 接收者ID |
| type | smallint | - | 否 | 1 | - | 消息类型：1-系统消息，2-活动消息，3-团队消息 |
| title | varchar | 100 | 否 | - | - | 消息标题 |
| content | text | - | 否 | - | - | 消息内容 |
| read_status | smallint | - | 否 | 0 | - | 读取状态：0-未读，1-已读 |
| created_at | timestamp | - | 否 | CURRENT_TIMESTAMP | - | 创建时间 |
| updated_at | timestamp | - | 否 | CURRENT_TIMESTAMP | - | 更新时间 |
| deleted_at | timestamp | - | 是 | null | - | 删除时间 |

### 评论表 (comments)

| 字段名 | 类型 | 长度 | 允许空 | 默认值 | 主键 | 说明 |
|--------|------|------|--------|--------|------|------|
| id | bigint | - | 否 | - | 是 | 评论ID |
| comment_id | bigint | - | 否 | - | - | 业务评论ID |
| activity_id | bigint | - | 否 | - | - | 活动ID |
| user_id | bigint | - | 否 | - | - | 评论用户ID |
| parent_id | bigint | - | 是 | null | - | 父评论ID，用于回复功能 |
| content | text | - | 否 | - | - | 评论内容 |
| likes | int | - | 否 | 0 | - | 点赞数 |
| status | smallint | - | 否 | 1 | - | 状态：0-隐藏，1-显示 |
| created_at | timestamp | - | 否 | CURRENT_TIMESTAMP | - | 创建时间 |
| updated_at | timestamp | - | 否 | CURRENT_TIMESTAMP | - | 更新时间 |
| deleted_at | timestamp | - | 是 | null | - | 删除时间 |

### 用户-团队关联表 (user_team)

| 字段名      | 类型      | 约束                 | 说明                     |
|------------|-----------|---------------------|--------------------------|
| user_id    | bigint    | NOT NULL            | 用户ID，关联users表的id    |
| team_id    | bigint    | NOT NULL            | 团队ID，关联teams表的id    |
| role       | varchar   | NULL                | 用户在团队中的角色          |
| joined_at  | timestamp | NOT NULL DEFAULT NOW() | 用户加入团队的时间      |
| created_at | timestamp | NOT NULL DEFAULT NOW() | 创建时间                |
| updated_at | timestamp | NOT NULL DEFAULT NOW() | 更新时间                |

**主键**: (user_id, team_id)  

**索引**:  

- idx_user_team_user (user_id)  
- idx_user_team_team (team_id)  

**外键约束**:  

- user_id 关联 users(id) ON DELETE CASCADE  
- team_id 关联 teams(id) ON DELETE CASCADE  

**说明**: 用户-团队多对多关系的中间表，记录用户与团队的关联关系，以及用户在团队中的角色和加入时间。
