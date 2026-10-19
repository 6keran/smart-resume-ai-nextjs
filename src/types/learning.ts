import { SupportedSkill } from './skills';

export interface YouTubeVideoResource {
  id: string;
  skill: SupportedSkill;
  title: string;
  channelName: string;
  channelAvatarUrl?: string;
  youtubeId: string;
  youtubeUrl: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Comprehensive';
  topicsCovered: string[];
  keyTakeaway: string;
}

export interface SkillLearningRoadmap {
  skill: SupportedSkill;
  overview: string;
  recommendedStudyHours: number;
  coreConcepts: string[];
  resources: YouTubeVideoResource[];
  retakeExamTips: string[];
}
