import React from 'react';
import { observer } from 'mobx-react';
import { Route, Routes } from 'react-router-dom';
import './styles/NewApp.css';
import { RootStore } from './stores/RootStore';
import { Header } from './components/page-content/Header';
import { Navigation } from './components/page-content/Navigation'
import { Home } from './components/page-content/Home'
import { VehicleList } from './components/vehicles/VehicleList';
import { PermitList } from './components/permits/PermitList';

@observer
export class App extends React.Component {
        private store: RootStore;
        public isHamburgerOpen: boolean = false;

        public constructor(props: any) {
                super(props);
                this.store = new RootStore();
        }

        public render(): JSX.Element {
                const store = this.store;
                return <div className="App">
                        <div className="grid-container">
                                <header className="header">
                                        <Header isHamburgerOpen={this.isHamburgerOpen} />
                                </header>
                                <aside className="navigation">
                                        <Navigation />
                                </aside>
                                <main className="main">
                                        <Routes>
                                                <Route path='/' element={<Home />} />
                                                <Route path='/Vehicles/all' element={<VehicleList store={store.VehiclesStore} gate={store.Gates} />} />
                                                <Route path='/Permits/all' element={<PermitList store={store.PermitStore} permitState={null} />} />
                                                <Route path='/Permits/planned' element={<PermitList store={store.PermitStore} permitState={"planned"} />} />
                                                <Route path='/Permits/inTerritory' element={<PermitList store={store.PermitStore} permitState={"inTerritory"} />} />
                                                <Route path='/Permits/completed' element={<PermitList store={store.PermitStore} permitState={"completed"} />} />
                                                <Route path='/Permits/missed' element={<PermitList store={store.PermitStore} permitState={"missed"} />} />
                                        </Routes>
                                </main>
                        </div>
                </div>
        }
}

export default App;
