export type CaseStatus = 'pending' | 'in-progress' | 'completed' | 'archived'

export interface Payment {
     amount: number 
     dueDate?: Date 
     isPaid: boolean
}

export interface ContractStage{
    title: string
    amount : number
    isPaid : boolean
}

export interface Case{
    id: string
    subject : string
    claim: string
    opponent: string
    caseNumber : string
    trackingCode : string
    status: CaseStatus
    contracts: ContractStage[]
    totalAmount: number
    paymentType: 'cash' | 'installment'
    installments?: Payment[]
    title?: string
    clientName?: string
    description?: string
    createdAt: Date      
    updatedAt: Date     
    lawyerId: string     
    
}