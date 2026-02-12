

export interface Case{
    id: string
    subject : string
    claim: string
    opponent: string
    caseNumber : string
    trackingCode : string
    contracts: ContractStage[]
}


export interface ContractStage{
    title: string
    amount : number
    isPaid : boolean
}

