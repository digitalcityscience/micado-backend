import { Entity, model, property, hasMany } from '@loopback/repository';
import { DocumentTypeTranslation } from './document-type-translation.model'
import { DocumentTypePicture } from './document-type-picture.model';

@model({
  settings: { idInjection: false, postgresql: { schema: 'micadoapp', table: 'document_type' } }
})
export class DocumentType extends Entity {
  @property({
    type: 'Number',
    required: false,
    scale: 0,
    id: true,
    generated: true,
    //    postgresql: {columnName: 'id', dataType: 'smallint', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'NO'},
  })
  id: number;

  @property({
    type: 'string',
    required: false,
    postgresql: { columnName: 'icon', dataType: 'text', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES' },
  })
  icon?: string;

  @property({
    type: 'string',
    length: 20,
    required: false,
    jsonSchema: { nullable: true },
    postgresql: { columnName: 'issuer', dataType: 'character varying', dataLength: 20, dataPrecision: null, dataScale: null, nullable: 'YES' },
  })
  issuer?: string;

  @property({
    type: 'string',
    postgresql: { columnName: 'model', dataType: 'text', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES' },
  })
  model?: string;

  @property({
    type: 'boolean',
    required: true,
    postgresql: { columnName: 'validable', dataType: 'boolean', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'NO' },
  })
  validable: boolean;

  @property({
    type: 'Number',
    scale: 0,
    postgresql: { columnName: 'validity_duration', dataType: 'smallint', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'YES' },
  })
  validityDuration?: number;


  @property({
    type: 'boolean'
  })
  published?: boolean;

  @property({
    type: 'date',
    postgresql: { columnName: 'publication_date', dataType: 'timestamp without time zone', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES' },
  })
  publicationDate?: string;

  @hasMany(() => DocumentTypeTranslation, { keyTo: 'id' })
  translations: DocumentTypeTranslation[];

  @hasMany(() => DocumentTypePicture)
  pictures: DocumentTypePicture[];
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //  [prop: string]: any;



  constructor(data?: Partial<DocumentType>) {
    super(data);
  }
}

export interface DocumentTypeRelations {
  // describe navigational properties here
}

export type DocumentTypeWithRelations = DocumentType & DocumentTypeRelations;
