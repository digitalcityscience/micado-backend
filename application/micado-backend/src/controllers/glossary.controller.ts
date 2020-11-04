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
import { Glossary } from '../models';
import { GlossaryRepository } from '../repositories';
import { MarkdownConverterService } from '../services/markdown-converter.service';

export class GlossaryController {
  constructor(
    @repository(GlossaryRepository)
    public glossaryRepository: GlossaryRepository,
    @service(MarkdownConverterService) private markdownConverterService: MarkdownConverterService
  ) { }

  @post('/glossaries', {
    responses: {
      '200': {
        description: 'Glossary model instance',
        content: { 'application/json': { schema: getModelSchemaRef(Glossary) } },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Glossary, {
            title: 'NewGlossary',
            exclude: ['id'],
          }),
        },
      },
    })
    glossary: Omit<Glossary, 'id'>,
  ): Promise<Glossary> {
    return this.glossaryRepository.create(glossary);
  }

  @get('/glossaries/count', {
    responses: {
      '200': {
        description: 'Glossary model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(
    @param.where(Glossary) where?: Where<Glossary>,
  ): Promise<Count> {
    return this.glossaryRepository.count(where);
  }

  @get('/glossaries', {
    responses: {
      '200': {
        description: 'Array of Glossary model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Glossary, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(Glossary) filter?: Filter<Glossary>,
  ): Promise<Glossary[]> {
    let glossaryElements = await this.glossaryRepository.find(filter);
    for (let glossaryElement of glossaryElements) {
      if (glossaryElement.translations) {
        for (let translation of glossaryElement.translations) {
          if (translation.description) {
            translation.description = await this.markdownConverterService.markdownToHTML(translation.description, translation.lang)
          }
        }
      }
    }
    return glossaryElements
  }

 /* @get('/glossaries/published', {
    responses: {
      '200': {
        description: 'Array of Published Glossary model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Glossary, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async findPublished(
    @param.filter(Glossary) filter?: Filter<Glossary>,
  ): Promise<Glossary[]> {
    return this.glossaryRepository.findPublished(filter);
  }*/

  @patch('/glossaries', {
    responses: {
      '200': {
        description: 'Glossary PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Glossary, { partial: true }),
        },
      },
    })
    glossary: Glossary,
    @param.where(Glossary) where?: Where<Glossary>,
  ): Promise<Count> {
    return this.glossaryRepository.updateAll(glossary, where);
  }

  @get('/glossaries/{id}', {
    responses: {
      '200': {
        description: 'Glossary model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Glossary, { includeRelations: true }),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Glossary, { exclude: 'where' }) filter?: FilterExcludingWhere<Glossary>
  ): Promise<Glossary> {
    let glossaryElement = await this.glossaryRepository.findById(id, filter);
    if (glossaryElement.translations) {
      for (let translation of glossaryElement.translations) {
        if (translation.description) {
          translation.description = await this.markdownConverterService.markdownToHTML(translation.description, translation.lang)
        }
      }
    }
    return glossaryElement
  }

  @patch('/glossaries/{id}', {
    responses: {
      '204': {
        description: 'Glossary PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Glossary, { partial: true }),
        },
      },
    })
    glossary: Glossary,
  ): Promise<void> {
    await this.glossaryRepository.updateById(id, glossary);
  }

  @put('/glossaries/{id}', {
    responses: {
      '204': {
        description: 'Glossary PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() glossary: Glossary,
  ): Promise<void> {
    await this.glossaryRepository.replaceById(id, glossary);
  }

  @del('/glossaries/{id}', {
    responses: {
      '204': {
        description: 'Glossary DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.glossaryRepository.deleteById(id);
  }
}
