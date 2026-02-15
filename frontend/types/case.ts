export type CaseStatus = 'pending' | 'in-progress' | 'completed' | 'archived'

export interface Case{
    id: string
    subject : string
    claim: string
    opponent: string
    caseNumber : string
    trackingCode : string
      status: CaseStatus
    contracts: ContractStage[]
}


export interface ContractStage{
    title: string
    amount : number
    isPaid : boolean
}

