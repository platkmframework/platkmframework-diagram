import { Link, Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom';           
 

 
import { NavigationDiagramModeler } from '../modules/modeler/navigation/NavigationDiagramModeler';
import { BpmnDiagramModeler } from '../modules/modeler/bpmn/BpmnDiagramModeler';
import { ModelerMenu } from '../modules/modeler/menu/ModelerMenu';
import { SequenceDiagramModeler } from '../modules/modeler/sequence/modeler/SequenceDiagramModeler';
import { EntitiesDiagramModeler } from '../modules/modeler/entities/modeler/EntitiesDiagramModeler';

export const AppRouter = () => {

  return (
    <>  
        <div>
          <ModelerMenu /> 
        </div>
        <Routes> 
          <Route path="/modeler/sequence" element={<SequenceDiagramModeler/>}/> 
          <Route path="/modeler/bpmn" element={<BpmnDiagramModeler/>}/> 
          <Route path="/modeler/navigator" element={<NavigationDiagramModeler/>}/> 
          <Route path="/modeler/entities" element={<EntitiesDiagramModeler/>}/> 
        </Routes>
    </>  
  )
}
