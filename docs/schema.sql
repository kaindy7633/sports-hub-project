-- SportsHub 数据库表结构

-- 创建 updated_at 自动更新的触发器函数
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 系统配置模块

-- 系统管理员表
CREATE TABLE managers (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    salt VARCHAR(32) NOT NULL,
    parent_id BIGINT NOT NULL DEFAULT 0,
    nick_name VARCHAR(50),
    real_name VARCHAR(50),
    avatar VARCHAR(255),
    email VARCHAR(100),
    phone VARCHAR(20),
    status SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON COLUMN managers.id IS '管理员ID';
COMMENT ON COLUMN managers.username IS '用户名';
COMMENT ON COLUMN managers.password IS '密码（加密存储）';
COMMENT ON COLUMN managers.salt IS '密码加密盐值';
COMMENT ON COLUMN managers.parent_id IS '父管理员ID，0表示超级管理员';
COMMENT ON COLUMN managers.nick_name IS '昵称';
COMMENT ON COLUMN managers.real_name IS '真实姓名';
COMMENT ON COLUMN managers.avatar IS '头像URL';
COMMENT ON COLUMN managers.email IS '电子邮箱';
COMMENT ON COLUMN managers.phone IS '手机号码';
COMMENT ON COLUMN managers.status IS '状态：0-禁用，1-正常';
COMMENT ON COLUMN managers.created_at IS '创建时间';
COMMENT ON COLUMN managers.updated_at IS '更新时间';
COMMENT ON COLUMN managers.deleted_at IS '删除时间';
COMMENT ON TABLE managers IS '系统管理员表，存储系统管理员信息，区别于普通用户';

CREATE TRIGGER update_managers_updated_at
BEFORE UPDATE ON managers
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 系统参数表
CREATE TABLE sys_configs (
    id BIGSERIAL PRIMARY KEY,
    param_key VARCHAR(50) NOT NULL,
    param_value VARCHAR(255) NOT NULL,
    param_type VARCHAR(20) NOT NULL,
    description VARCHAR(255),
    status SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON COLUMN sys_configs.id IS '参数ID';
COMMENT ON COLUMN sys_configs.param_key IS '参数键名';
COMMENT ON COLUMN sys_configs.param_value IS '参数键值';
COMMENT ON COLUMN sys_configs.param_type IS '参数类型：string/number/boolean/json';
COMMENT ON COLUMN sys_configs.description IS '参数描述';
COMMENT ON COLUMN sys_configs.status IS '状态：0-禁用，1-正常';
COMMENT ON COLUMN sys_configs.created_at IS '创建时间';
COMMENT ON COLUMN sys_configs.updated_at IS '更新时间';
COMMENT ON COLUMN sys_configs.deleted_at IS '删除时间';
COMMENT ON TABLE sys_configs IS '系统参数表，用于存储系统级别的配置参数';

CREATE TRIGGER update_sys_configs_updated_at
BEFORE UPDATE ON sys_configs
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 系统字典表
CREATE TABLE sys_dict_types (
    id BIGSERIAL PRIMARY KEY,
    dict_name VARCHAR(50) NOT NULL,
    dict_type VARCHAR(50) NOT NULL,
    status SMALLINT NOT NULL DEFAULT 1,
    remark VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON COLUMN sys_dict_types.id IS '字典类型ID';
COMMENT ON COLUMN sys_dict_types.dict_name IS '字典名称';
COMMENT ON COLUMN sys_dict_types.dict_type IS '字典类型';
COMMENT ON COLUMN sys_dict_types.status IS '状态：0-禁用，1-正常';
COMMENT ON COLUMN sys_dict_types.remark IS '备注';
COMMENT ON COLUMN sys_dict_types.created_at IS '创建时间';
COMMENT ON COLUMN sys_dict_types.updated_at IS '更新时间';
COMMENT ON COLUMN sys_dict_types.deleted_at IS '删除时间';
COMMENT ON TABLE sys_dict_types IS '系统字典表，用于存储系统字典的类型定义';

CREATE TRIGGER update_sys_dict_types_updated_at
BEFORE UPDATE ON sys_dict_types
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 系统字典数据表
CREATE TABLE sys_dict_data (
    id BIGSERIAL PRIMARY KEY,
    dict_type_id BIGINT NOT NULL,
    dict_label VARCHAR(100) NOT NULL,
    dict_value VARCHAR(100) NOT NULL,
    dict_sort INT NOT NULL DEFAULT 0,
    status SMALLINT NOT NULL DEFAULT 1,
    remark VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON COLUMN sys_dict_data.id IS '字典数据ID';
COMMENT ON COLUMN sys_dict_data.dict_type_id IS '字典类型ID';
COMMENT ON COLUMN sys_dict_data.dict_label IS '字典标签';
COMMENT ON COLUMN sys_dict_data.dict_value IS '字典键值';
COMMENT ON COLUMN sys_dict_data.dict_sort IS '字典排序';
COMMENT ON COLUMN sys_dict_data.status IS '状态：0-禁用，1-正常';
COMMENT ON COLUMN sys_dict_data.remark IS '备注';
COMMENT ON COLUMN sys_dict_data.created_at IS '创建时间';
COMMENT ON COLUMN sys_dict_data.updated_at IS '更新时间';
COMMENT ON COLUMN sys_dict_data.deleted_at IS '删除时间';
COMMENT ON TABLE sys_dict_data IS '系统字典数据表，用于存储系统字典的具体数据项';

CREATE TRIGGER update_sys_dict_data_updated_at
BEFORE UPDATE ON sys_dict_data
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 用户模块

-- 用户基本信息表
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    salt VARCHAR(32) NOT NULL,
    nick_name VARCHAR(50),
    real_name VARCHAR(50),
    id_card VARCHAR(18),
    avatar VARCHAR(255),
    email VARCHAR(100),
    phone VARCHAR(20),
    emergency_contact VARCHAR(20),
    address VARCHAR(255),
    gender SMALLINT,
    birthday DATE,
    status SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON COLUMN users.id IS '用户ID';
COMMENT ON COLUMN users.user_id IS '业务用户ID';
COMMENT ON COLUMN users.username IS '用户名';
COMMENT ON COLUMN users.password IS '密码（加密存储）';
COMMENT ON COLUMN users.salt IS '密码加密盐值';
COMMENT ON COLUMN users.nick_name IS '昵称';
COMMENT ON COLUMN users.real_name IS '真实姓名';
COMMENT ON COLUMN users.id_card IS '身份证号码';
COMMENT ON COLUMN users.avatar IS '头像URL';
COMMENT ON COLUMN users.email IS '电子邮箱';
COMMENT ON COLUMN users.phone IS '手机号码';
COMMENT ON COLUMN users.emergency_contact IS '紧急联系人电话';
COMMENT ON COLUMN users.address IS '住址';
COMMENT ON COLUMN users.gender IS '性别：0-未知，1-男，2-女';
COMMENT ON COLUMN users.birthday IS '出生日期';
COMMENT ON COLUMN users.status IS '状态：0-禁用，1-正常';
COMMENT ON COLUMN users.created_at IS '创建时间';
COMMENT ON COLUMN users.updated_at IS '更新时间';
COMMENT ON COLUMN users.deleted_at IS '删除时间';
COMMENT ON TABLE users IS '用户基本信息表，存储用户的基本资料';

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 用户认证表
CREATE TABLE user_auths (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    identity_type VARCHAR(20) NOT NULL,
    identifier VARCHAR(100) NOT NULL,
    credential VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON COLUMN user_auths.id IS '认证ID';
COMMENT ON COLUMN user_auths.user_id IS '关联用户ID';
COMMENT ON COLUMN user_auths.identity_type IS '认证类型：password/email/phone/wechat/weibo';
COMMENT ON COLUMN user_auths.identifier IS '认证标识（用户名/手机号/邮箱/第三方应用的唯一标识）';
COMMENT ON COLUMN user_auths.credential IS '凭证（密码/验证码/token）';
COMMENT ON COLUMN user_auths.created_at IS '创建时间';
COMMENT ON COLUMN user_auths.updated_at IS '更新时间';
COMMENT ON COLUMN user_auths.deleted_at IS '删除时间';
COMMENT ON TABLE user_auths IS '用户认证表，存储用户的各种认证方式';

CREATE TRIGGER update_user_auths_updated_at
BEFORE UPDATE ON user_auths
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 用户角色表
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    role_id BIGINT NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    status SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON COLUMN roles.id IS 'ID';
COMMENT ON COLUMN roles.role_id IS '角色ID';
COMMENT ON COLUMN roles.name IS '角色名称';
COMMENT ON COLUMN roles.code IS '角色编码';
COMMENT ON COLUMN roles.description IS '角色描述';
COMMENT ON COLUMN roles.status IS '状态：0-禁用，1-正常';
COMMENT ON COLUMN roles.created_at IS '创建时间';
COMMENT ON COLUMN roles.updated_at IS '更新时间';
COMMENT ON COLUMN roles.deleted_at IS '删除时间';
COMMENT ON TABLE roles IS '用户角色表，定义系统中的角色'

CREATE TRIGGER update_roles_updated_at
BEFORE UPDATE ON roles
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 用户角色关联表
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

COMMENT ON COLUMN user_roles.user_id IS '用户ID';
COMMENT ON COLUMN user_roles.role_id IS '角色ID';
COMMENT ON COLUMN user_roles.created_at IS '创建时间';
COMMENT ON TABLE user_roles IS '用户角色关联表，存储用户与角色的多对多关系';

-- 业务模块

-- 活动类型表
CREATE TABLE activity_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(50) NOT NULL,
    icon VARCHAR(255),
    description VARCHAR(255),
    status SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON COLUMN activity_types.id IS '活动类型ID';
COMMENT ON COLUMN activity_types.name IS '活动类型名称';
COMMENT ON COLUMN activity_types.code IS '活动类型编码';
COMMENT ON COLUMN activity_types.icon IS '活动类型图标';
COMMENT ON COLUMN activity_types.description IS '活动类型描述';
COMMENT ON COLUMN activity_types.status IS '状态：0-禁用，1-正常';
COMMENT ON COLUMN activity_types.created_at IS '创建时间';
COMMENT ON COLUMN activity_types.updated_at IS '更新时间';
COMMENT ON COLUMN activity_types.deleted_at IS '删除时间';
COMMENT ON TABLE activity_types IS '活动类型表，定义系统支持的各种活动类型';

CREATE TRIGGER update_activity_types_updated_at
BEFORE UPDATE ON activity_types
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 活动表
CREATE TABLE activities (
    id BIGSERIAL PRIMARY KEY,
    activity_id BIGINT NOT NULL UNIQUE,
    title VARCHAR(100) NOT NULL,
    type_id BIGINT NOT NULL,
    venue_id BIGINT NOT NULL,
    creator_id BIGINT NOT NULL,
    team_id BIGINT,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    max_participants INT NOT NULL DEFAULT 0,
    current_participants INT NOT NULL DEFAULT 0,
    fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON COLUMN activities.id IS '活动ID';
COMMENT ON COLUMN activities.activity_id IS '业务活动ID';
COMMENT ON COLUMN activities.title IS '活动标题';
COMMENT ON COLUMN activities.type_id IS '活动类型ID';
COMMENT ON COLUMN activities.venue_id IS '场地ID';
COMMENT ON COLUMN activities.creator_id IS '创建者ID';
COMMENT ON COLUMN activities.team_id IS '关联团队ID';
COMMENT ON COLUMN activities.description IS '活动描述';
COMMENT ON COLUMN activities.start_time IS '开始时间';
COMMENT ON COLUMN activities.end_time IS '结束时间';
COMMENT ON COLUMN activities.max_participants IS '最大参与人数，0表示不限制';
COMMENT ON COLUMN activities.current_participants IS '当前参与人数';
COMMENT ON COLUMN activities.fee IS '参与费用';
COMMENT ON COLUMN activities.status IS '状态：0-草稿，1-已发布，2-未开始，3-进行中，4-已结束';
COMMENT ON COLUMN activities.created_at IS '创建时间';
COMMENT ON COLUMN activities.updated_at IS '更新时间';
COMMENT ON COLUMN activities.deleted_at IS '删除时间';
COMMENT ON TABLE activities IS '活动表，存储系统中的各种活动信息';

CREATE TRIGGER update_activities_updated_at
BEFORE UPDATE ON activities
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 场所表
CREATE TABLE venues (
    id BIGSERIAL PRIMARY KEY,
    venue_id BIGINT NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    business_hours VARCHAR(100),
    facilities TEXT,
    images TEXT,
    status SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON COLUMN venues.id IS '场地ID';
COMMENT ON COLUMN venues.venue_id IS '业务场地ID';
COMMENT ON COLUMN venues.name IS '场地名称';
COMMENT ON COLUMN venues.address IS '场地地址';
COMMENT ON COLUMN venues.contact_phone IS '联系电话';
COMMENT ON COLUMN venues.business_hours IS '营业时间';
COMMENT ON COLUMN venues.facilities IS '场地设施描述';
COMMENT ON COLUMN venues.images IS '场地图片，JSON数组';
COMMENT ON COLUMN venues.status IS '状态：0-禁用，1-正常';
COMMENT ON COLUMN venues.created_at IS '创建时间';
COMMENT ON COLUMN venues.updated_at IS '更新时间';
COMMENT ON COLUMN venues.deleted_at IS '删除时间';
COMMENT ON TABLE venues IS '场所表，存储体育场馆、活动场地等场所信息';

CREATE TRIGGER update_venues_updated_at
BEFORE UPDATE ON venues
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 团队表
CREATE TABLE teams (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    logo VARCHAR(255),
    description TEXT,
    leader_id BIGINT NOT NULL,
    max_members INT NOT NULL DEFAULT 0,
    current_members INT NOT NULL DEFAULT 0,
    status SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON COLUMN teams.id IS '团队ID';
COMMENT ON COLUMN teams.team_id IS '业务团队ID';
COMMENT ON COLUMN teams.name IS '团队名称';
COMMENT ON COLUMN teams.logo IS '团队logo';
COMMENT ON COLUMN teams.description IS '团队描述';
COMMENT ON COLUMN teams.leader_id IS '队长ID';
COMMENT ON COLUMN teams.max_members IS '最大成员数，0表示不限制';
COMMENT ON COLUMN teams.current_members IS '当前成员数';
COMMENT ON COLUMN teams.status IS '状态：0-解散，1-正常';
COMMENT ON COLUMN teams.created_at IS '创建时间';
COMMENT ON COLUMN teams.updated_at IS '更新时间';
COMMENT ON COLUMN teams.deleted_at IS '删除时间';
COMMENT ON TABLE teams IS '团队表，存储运动团队、俱乐部等组织信息';

CREATE TRIGGER update_teams_updated_at
BEFORE UPDATE ON teams
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 消息表
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    message_id BIGINT NOT NULL UNIQUE,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    type SMALLINT NOT NULL DEFAULT 1,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    read_status SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON COLUMN messages.id IS '消息ID';
COMMENT ON COLUMN messages.message_id IS '业务消息ID';
COMMENT ON COLUMN messages.sender_id IS '发送者ID';
COMMENT ON COLUMN messages.receiver_id IS '接收者ID';
COMMENT ON COLUMN messages.type IS '消息类型：1-系统消息，2-活动消息，3-团队消息';
COMMENT ON COLUMN messages.title IS '消息标题';
COMMENT ON COLUMN messages.content IS '消息内容';
COMMENT ON COLUMN messages.read_status IS '阅读状态：0-未读，1-已读';
COMMENT ON COLUMN messages.created_at IS '创建时间';
COMMENT ON COLUMN messages.updated_at IS '更新时间';
COMMENT ON COLUMN messages.deleted_at IS '删除时间';
COMMENT ON TABLE messages IS '消息表，存储系统内的各类消息通知';

CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 评论表
CREATE TABLE comments (
    id BIGSERIAL PRIMARY KEY,
    comment_id BIGINT NOT NULL UNIQUE,
    activity_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    parent_id BIGINT,
    content TEXT NOT NULL,
    likes INT NOT NULL DEFAULT 0,
    status SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON COLUMN comments.id IS '评论ID';
COMMENT ON COLUMN comments.comment_id IS '业务评论ID';
COMMENT ON COLUMN comments.activity_id IS '活动ID';
COMMENT ON COLUMN comments.user_id IS '评论用户ID';
COMMENT ON COLUMN comments.parent_id IS '父评论ID，用于回复功能';
COMMENT ON COLUMN comments.content IS '评论内容';
COMMENT ON COLUMN comments.likes IS '点赞数量';
COMMENT ON COLUMN comments.status IS '状态：0-隐藏，1-显示';
COMMENT ON COLUMN comments.created_at IS '创建时间';
COMMENT ON COLUMN comments.updated_at IS '更新时间';
COMMENT ON COLUMN comments.deleted_at IS '删除时间';
COMMENT ON TABLE comments IS '评论表，存储用户对活动的评论信息';

CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 创建用户-团队中间表
CREATE TABLE user_team (
    user_id bigint NOT NULL,
    team_id bigint NOT NULL,
    role varchar(50) NULL,
    joined_at timestamp NOT NULL DEFAULT NOW(),
    created_at timestamp NOT NULL DEFAULT NOW(),
    updated_at timestamp NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, team_id),
    CONSTRAINT fk_user_team_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_team_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX idx_user_team_user ON user_team(user_id);
CREATE INDEX idx_user_team_team ON user_team(team_id);