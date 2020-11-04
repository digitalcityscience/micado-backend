import { service } from '@loopback/core';
import {
  Count,
  CountSchema,
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
import { Information } from '../models';
import { InformationRepository } from '../repositories';
import { MarkdownConverterService } from '../services/markdown-converter.service';

export class InformationController {
  constructor(
    @repository(InformationRepository)
    public informationRepository: InformationRepository,
    @service(MarkdownConverterService) private markdownConverterService: MarkdownConverterService
  ) { }

  @post('/information', {
    responses: {
      '200': {
        description: 'Information model instance',
        content: { 'application/json': { schema: getModelSchemaRef(Information) } },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Information, {
            title: 'NewInformation',
            exclude: ['id'],
          }),
        },
      },
    })
    information: Omit<Information, 'id'>,
  ): Promise<Information> {
    return this.informationRepository.create(information);
  }

  @post('/information/unpublished', {
    responses: {
      '200': {
        description: 'Information model instance (unpublished)',
        content: { 'application/json': { schema: getModelSchemaRef(Information) } },
      },
    },
  })
  async createUnpublished(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Information, {
            title: 'NewUnpublishedInformation',
            exclude: ['id'],
            //optional: ['published']
          }),
        },
      },
    })
    information: Omit<Information, 'id'>,
  ): Promise<Information> {
    //information.published = false
    return this.informationRepository.create(information);
  }

  @get('/information/count', {
    responses: {
      '200': {
        description: 'Information model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(
    @param.where(Information) where?: Where<Information>,
  ): Promise<Count> {
    return this.informationRepository.count(where);
  }

  @get('/information', {
    responses: {
      '200': {
        description: 'Array of Information model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Information, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(Information) filter?: Filter<Information>,
  ): Promise<Information[]> {
    let infoElements = await this.informationRepository.find(filter);
    for (let infoElement of infoElements) {
      if (infoElement.translations) {
        for (let translation of infoElement.translations) {
          if (translation.description && translation.lang) {
            translation.description = await this.markdownConverterService.markdownToHTML(translation.description, translation.lang)
          }
        }
      }
    }
    return infoElements
  }

  /*@get('/information/published', {
    responses: {
      '200': {
        description: 'Array of Published Information model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Information, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async findPublished(
    @param.filter(Information) filter?: Filter<Information>,
  ): Promise<Information[]> {
    return this.informationRepository.findPublished(filter);
  }*/

  @patch('/information', {
    responses: {
      '200': {
        description: 'Information PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Information, { partial: true }),
        },
      },
    })
    information: Information,
    @param.where(Information) where?: Where<Information>,
  ): Promise<Count> {
    return this.informationRepository.updateAll(information, where);
  }

  @get('/information/{id}', {
    responses: {
      '200': {
        description: 'Information model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Information, { includeRelations: true }),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Information, { exclude: 'where' }) filter?: FilterExcludingWhere<Information>
  ): Promise<Information> {
    let infoElement = await this.informationRepository.findById(id, filter);
    for (let translation of infoElement.translations) {
      if (translation.description && translation.lang) {
        translation.description = await this.markdownConverterService.markdownToHTML(translation.description, translation.lang)
      }
    }
    return infoElement
  }

  @patch('/information/{id}', {
    responses: {
      '204': {
        description: 'Information PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Information, { partial: true }),
        },
      },
    })
    information: Information,
  ): Promise<void> {
    await this.informationRepository.updateById(id, information);
  }

  @patch('/information/{id}/unpublished', {
    responses: {
      '204': {
        description: 'Information PATCH success (marks information as unpublished in the process)',
      },
    },
  })
  async updateByIdUnpublished(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Information, { partial: true }),
        },
      },
    })
    information: Information,
  ): Promise<void> {
    //information.published = false
    await this.informationRepository.updateById(id, information);
  }

  @put('/information/{id}', {
    responses: {
      '204': {
        description: 'Information PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() information: Information,
  ): Promise<void> {
    await this.informationRepository.replaceById(id, information);
  }

  @del('/information/{id}', {
    responses: {
      '204': {
        description: 'Information DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.informationRepository.deleteById(id);
  }
}
