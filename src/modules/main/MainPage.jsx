import { useState } from "react";
import { useFetch } from "../../hooks/useFetch";
import { useMessage } from "../../hooks/useMessage";

const titles = ['Generar Token', 'Listado de plantillas', 'Configuraciones', 'Cambiar contraseña' ]

export const MainPage = () =>{

    const [open, setOpen] = useState(false); 
    const [showProgress, setShowProgress]     = useState(false) 
    const [initPasswordProcess, setInitPasswordProcess]     = useState(false) 
    const [currentOption, setCurrentOption] = useState(0)
    const [cliToken, setCliToken] = useState('')
    const [cliConfiguration, setCliConfiguration] = useState({countTokenRequestByDay:0, countGenerationRequetByDay:0, countGenerationTemplateByRequest:0})
    const  {msg, error, clean, success} = useMessage();
    const {post, get, logout} = useFetch();

    const handleGenerateCliToken = (event)=>{
        event.preventDefault();
        clean()
        setShowProgress(true)
        post({url:'user/generate/token'},
            (status, data)=>{  
                setShowProgress(false)
                setCliToken(data.value);
                setOpen(true)
            }, (status, msg)=>{
                setShowProgress(false)
                error(msg)
            } 
        ) 
    }

    const onHandlerOpenActionGenerateToken = (event, option) =>{
        event.preventDefault(); 
        setCurrentOption(option)
    }

    const onHandlerOpenActionChangePassword = (event, option) =>{
        event.preventDefault(); 
        setCurrentOption(option)
        setInitPasswordProcess(true)
    }
    const onHandlerOpenActionMenu = (event, option) =>{
        event.preventDefault(); 
        set
        setCurrentOption(option) 
    }
    const onHandlerOpenActionNavigation = (event, option) =>{
        event.preventDefault(); 
        setCurrentOption(option) 
    }

    const onHandlerOpenActionConfig = (event, option) =>{
        event.preventDefault(); 
        clean()
        setCurrentOption(option)
        setShowProgress(true)
        get({url:'user/configurations'},
            (status, data)=>{  
                setShowProgress(false)
                setCliConfiguration(data); 
            }, (status, msg)=>{
                setShowProgress(false)
                error(msg)
            } 
        ) 

    }
 

    return (<>
{/* <div className="conten_section">
  <div className="left">1</div> 
  <div className="right">3</div>
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tristique
    sapien ac erat tincidunt, sit amet dignissim lectus vulputate. Donec id
    iaculis velit. Aliquam vel malesuada erat. Praesent non magna ac massa
    aliquet tincidunt vel in massa. Phasellus feugiat est vel leo finibus
    congue.
  </p>
</div> */}
    </>)
}