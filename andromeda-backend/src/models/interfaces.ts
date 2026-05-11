import { ObjectId } from 'mongodb';

export type AccountType = 'student' | 'teacher' | 'admin';

export interface User {
  _id?: ObjectId;
  UserName: string;
  FullName?: string;
  Email: string;
  Password: string;
  Salt: string;
  AccountType: AccountType;
  Phone?: string;
  Contact?: string;
  ProfilePic?: string;
  FCM?: string;
  Gender?: string;
  Board?: string;
  Grade?: string;
  Key?: string;
  CreatedOn?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserResponse {
  _id: string;
  UserName: string;
  Email: string;
  AccountType: AccountType;
  Phone?: string;
  ProfilePic?: string;
  createdAt?: Date;
}

export interface Class {
  _id?: ObjectId;
  ClassName: string;
  ClassCode: string;
  TeacherName: string;
  TeacherEmail?: string;
  Students?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FileRecord {
  _id?: ObjectId;
  FileName: string;
  FilePath: string;
  FileSize: number;
  FileType: string;
  UploadedBy: string;
  ClassName?: string;
  uploadedAt?: Date;
  updatedAt?: Date;
}

export interface Notification {
  _id?: ObjectId;
  Title: string;
  Description: string;
  CreatedBy: string;
  ClassName?: string;
  CreatedFor: string;
  IsRead?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Schedule {
  _id?: ObjectId;
  ClassName: string;
  Start: string;
  End: string;
  Topic: string;
  TeacherName: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RecycleContent {
  _id?: ObjectId;
  ContentType: 'file' | 'notification' | 'schedule';
  ContentId: string;
  DeletedBy: string;
  deletedAt?: Date;
}

export interface LoginToken {
  _id?: ObjectId;
  token: string;
  UserName: string;
  FCM?: string;
  createdAt?: Date;
}

export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  msg: string;
  data?: T;
}

export interface JwtUser {
  name: string;
  account: AccountType;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtUser;
    }
  }
}