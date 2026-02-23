// 简历主实体
export interface Resume {
  id: string;            // UUID
  userId: string;        // 所属用户
  title: string;         // 简历标题
  cover?: string;        // 缩略图 URL (可选，用于列表页优化)
  content: ResumeContent;// 核心数据内容
  themeConfig: ThemeConfig; // 主题配置
  createdAt: string;
  updatedAt: string;
}

// 核心内容结构
export interface ResumeContent {
  profile: ProfileData;
  educations: EducationItem[];
  experiences: ExperienceItem[];
  projects: ProjectItem[];
  awards: AwardItem[];
  skills: string[];
  customModules: CustomModule[];
  // 模块排序与显示控制
  layout: {
    order: string[]; // 模块 ID 列表
    hidden: string[]; // 隐藏的模块 ID
  };
}

// 主题配置
export interface ThemeConfig {
  primaryColor: string; // e.g., '#6366f1'
  fontFamily: string;
  templateId: string;   // 'classic' | 'modern' | 'minimal'
  spacing: number;      // 间距系数
  pagePadding?: number; // 画布页面内边距（px）
  blockPadding?: number; // 模块内边距（px）
  blockGap?: number; // 卡片间距（px）
  blockDividerEnabled?: boolean; // 是否显示块底部分隔线
  blockDividerWidth?: number; // 分隔线粗细（px）
  blockDividerColor?: string; // 分隔线颜色
  canvasOffsetX?: number; // 画布水平偏移
  canvasOffsetY?: number; // 画布垂直偏移
}

// 基础信息
export interface ProfileData {
  name: string;
  title: string; // 求职意向 / 职位
  email: string;
  phone: string;
  location?: string;
  avatar?: string;
  summary?: string; // 个人简介
}

// 教育经历
export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  major: string;
  startDate: string;
  endDate: string;
  description?: string;
}

// 工作经历
export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string; // 富文本或多行文本
}

// 项目经历
export interface ProjectItem {
  id: string;
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  link?: string;
}

// 获奖
export interface AwardItem {
  id: string;
  name: string;
  level?: string;
  org?: string;
  date?: string;
  detail?: string;
}

// 自定义模块 (如：奖项、证书、语言)
export interface CustomModule {
  id: string;
  title: string;
  type: 'list' | 'text'; // 列表型或文本型
  items: Array<{ id: string; title: string; subtitle?: string; description?: string }>;
}
