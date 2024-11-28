export const useData = () =>{

    const generateKey = (pre) => {
        return pre + Math.random()
    }

    const newDataElementByPrefix = (prefix)=>{
        return {
            id: generateKey(prefix), 
            name:'', 
            label:'', 
            code:'', 
            type:'', 
            order:0, 
            visible:true, 
            description:'', 
            htmlType:'', 
            pk:false, 
            fk:false, 
            fktablename:'', 
            options:'', 
            datasource:'', 
            roles:'', 
            dateformat:''
        }  
    } 
    const newDataElement = ()=>{
        return newDataElementByPrefix('')
    }

    //--
    const newTemplateConfigData = () =>{
        return newTemplateConfigDataPrefix('')
    }
    const newTemplateConfigDataPrefix = (prefix) =>{
        return {rcode:'', 
            content:{
                id: generateKey(prefix), 
                code:'', 
                name:'', 
                type:'form', 
                rcode:'',
                splitType:'', 
                description:'', 
                columnCount:1, 
                fields:[],
                templates:[], 
                children:[],
                actions:[]
            }
        }
    }

    //--
    const newContainerData = (prefix) =>{
        return newActionDataPrefix(prefix)
    }
    const newContainerDataPrefix = (prefix) =>{
        return {
            id:generateKey(prefix), 
            code:'', 
            name:'', 
            type:'form', 
            rcode:'',
            splitType:'', 
            description:'', 
            columnCount:1, 
            fields:[],
            templates:[], 
            children:[],
            actions:[]
        }
    }

    //--
    const newActionData = () =>{
        return newActionDataPrefix('')
    }
    const newActionDataPrefix = (prefix) =>{
        return {
            id: generateKey(prefix), 
            code:'',
            label:'',
            name:'',
            type:'SAVE', 
            router:'', 
            dependentActions:[],
            parameters:[]
        }
    }

    //--
    const newWorkSpaceData = () =>{
        return newWorkSpaceDataPrefix('')
    }

    const newWorkSpaceDataPrefix = (prefix) =>{
        return {
            id: generateKey(prefix), 
            type:'WORKSPACE',
            name:'',
            description: '', 
            variables:[] , 
            settings:{id:generateKey('setting_')}, 
            cookies:{id:generateKey('cookies_')}, 
            environments:[] , 
            children:[] 
        }
    }


    const newProjectData = () =>{
        return newProjectDataPrefix('')
    }

    const newProjectDataPrefix = (prefix) =>{
        return {
            id: generateKey(prefix), 
            type:'PROJECT',
            name:'',
            description: '', 
            parameters:[] , 
            authorization:{id:generateKey('authorization_')}, 
            headers:{id:generateKey('headers_')}, 
            body:{id:generateKey('body_')},
            settings:{id:generateKey('settings_')}, 
            apimethod:'',
            apiurl:'',
            interfaceDefinition:{id:generateKey('interfaceDefinition_')}, 
            children:[] 
        }
    }

    const newSelectedShapeData = () => {
        return {
            id:'', 
            type:'', 
            subtype:'', 
            position:'',
            mx:'',
            my:'',
            mousestyle:'', 
            currentShape:'',
            shape:'',
            acceptedIncomingType: [], 
            acceptedOutgoingType:[]
        }
    }
    
    return {
        newDataElement, newDataElementByPrefix, 
        newTemplateConfigData, newTemplateConfigDataPrefix, 
        newContainerData, newContainerDataPrefix,  
        newActionData, newActionDataPrefix,
        newProjectData, newProjectDataPrefix,
        newWorkSpaceData, newWorkSpaceDataPrefix,
        newSelectedShapeData
    }
}