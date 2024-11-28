

export const newSelectedShapeData = () => {
    return {
        id:'', 
        type:'', 
        subtype:'',
        subtypeId:'', 
        position:'',
        mx:'',
        my:'',
        mousestyle:'', 
        currentShape:'',
        moveStarted:false,
        shape:'',
        acceptedIncomingType: [], 
        acceptedOutgoingType:[],
        connections:[]
    }
}