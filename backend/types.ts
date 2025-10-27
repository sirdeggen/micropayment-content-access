// TODO add the fields of the outputs and any other keys that you want to store on the database
export interface ContentRecord {
  txid: string
  outputIndex: number  
  createdAt: Date   // Used as an example
}

// Used to identify a UTXO that is admitted by the Topic Manager
export interface UTXOReference {
  txid: string
  outputIndex: number
}