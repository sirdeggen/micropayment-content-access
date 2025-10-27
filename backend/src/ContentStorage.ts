import { Collection, Db } from 'mongodb'
import { ContentRecord, UTXOReference } from '../types'

// Content for a Storage System that can be modified for your specific use-case.
export class ContentStorage {
  private readonly records: Collection<ContentRecord>

  /**
   * Constructs a new instance of the database
   * @param {Db} db - A connected MongoDB database instance.
   */
  constructor(private readonly db: Db) {
    this.records = db.collection<ContentRecord>('template record')
  }

  /* Ensures a text index exists for the `message` field, enabling efficient searches.
   * The index is named `MessageTextIndex`.
   */
  private async createSearchableIndex(): Promise<void> {
    await this.records.createIndex({ message: 'text' }, { name: 'MessageTextIndex' })
  }

  /**
   * Stores a new record in the database.
   * @param {string} txid - The transaction ID associated with this record
   * @param {number} outputIndex - The UTXO output index
   * @returns {Promise<void>} - Resolves when the record has been successfully stored
   */
  async storeRecord(txid: string, outputIndex: number): Promise<void> {
    await this.records.insertOne({
      txid,
      outputIndex,
      createdAt: new Date()
    })
  }

  /**
   * Deletes a record that matches the given transaction ID and output index.
   * @param {string} txid - The transaction ID of the record to delete
   * @param {number} outputIndex - The UTXO output index of the record to delete
   * @returns {Promise<void>} - Resolves when the record has been successfully deleted
   */
  async deleteRecord(txid: string, outputIndex: number): Promise<void> {
    await this.records.deleteOne({ txid, outputIndex })
  }

  /**
   * Example query: retrieves all records stored on the database  
   * @returns {Promise<UTXOReference[]>} - Resolves with an array of UTXO references
   */
  async findAll(): Promise<UTXOReference[]> {
    const query: any = {}
    return await this.records.find(query)
      .project<UTXOReference>({ txid: 1, outputIndex: 1 })
      .toArray()
      .then(results => results.map(record => ({
        txid: record.txid,
        outputIndex: record.outputIndex
      })))
  }
  
  // TODO additional custom query functions can be added here.
}