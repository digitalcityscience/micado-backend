// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';
import {
  Count,
  CountSchema,
  AnyType,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
} from '@loopback/rest';
import {service} from '@loopback/core';
import { TopicTranslationRepository } from '../repositories';
import {promises as fsAsync} from 'fs';
import fs from 'fs';
import simpleGit, {SimpleGit} from 'simple-git';
import { TranslationService } from '../services';

export class SendToTranslationController {
  constructor(
    @repository(TopicTranslationRepository) public topicTranslationRepository: TopicTranslationRepository,
    @service() public translationService: TranslationService
  ) {
   }


  @get('/sendtotranslation', {
    responses: {
      '200': {
        description: 'Topic export',
        content: { 'application/json': { schema: AnyType } },
      },
    },
  })
  async sendtotranslation (

  ): Promise<any> {
    this.translationService.uploadTranslatables();
  }
}
