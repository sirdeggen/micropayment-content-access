import docs from './ContentLookupDocs.md'
import {
  LookupService,
  LookupQuestion,
  LookupAnswer,
  LookupFormula,
  AdmissionMode,
  SpendNotificationMode,
  OutputAdmittedByTopic,
  OutputSpent
} from '@bsv/overlay'
import { ContentStorage } from './ContentStorage.js'
import { Db } from 'mongodb'

/**
 * Content for a Lookup Service that can be modified for your speicific use-case.
 */
export class ContentLookupService implements LookupService {
   readonly admissionMode!: AdmissionMode
   readonly spendNotificationMode!: SpendNotificationMode
  constructor(public storage: ContentStorage) { }
    outputNoLongerRetainedInHistory?: ((txid: string, outputIndex: number, topic: string) => Promise<void> | void) | undefined

  /**
   * Invoked when a new output is added to the overlay.
   * @param payload 
   */
  async outputAdmittedByTopic(payload: OutputAdmittedByTopic): Promise<void> {
    // TODO add the admitted output to the storage database
    return
  }

  /**
   * Invoked when a UTXO is spent
   * @param payload - The output admitted by the topic manager
   */
  async outputSpent(payload: OutputSpent): Promise<void> {
    // TODO remove the spent output from the storage database
    return
  }

  /**
   * LEGAL EVICTION: Permanently remove the referenced UTXO from all indices maintained by the Lookup Service
   * @param txid - The transaction ID of the output to evict
   * @param outputIndex - The index of the output to evict
   */
  async outputEvicted(txid: string, outputIndex: number): Promise<void> {
    await this.storage.deleteRecord(txid, outputIndex)
    return
  }

  /**
   * Answers a lookup query
   * @param question - The lookup question to be answered
   * @returns A promise that resolves to a lookup formula
   */
  async lookup(question: LookupQuestion): Promise<LookupFormula> {
    throw Error('TODO implement')
  }

  /** Overlay docs. */
  async getDocumentation(): Promise<string> {
    return docs
  }

  /** Metadata for overlay hosts. */
  async getMetaData(): Promise<{
    name: string
    shortDescription: string
    iconURL?: string
    version?: string
    informationURL?: string
  }> {
    return {
      name: 'Content Lookup Service',
      shortDescription: 'Find messages on-chain'
    }
  }
}

// Factory
export default (db: Db): ContentLookupService => new ContentLookupService(new ContentStorage(db))