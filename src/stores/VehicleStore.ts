import { Vehicle, IVehicleItem, PanelState } from "../model/Vehicle";
import { observable, action, makeObservable, computed, runInAction } from 'mobx';
import { RootStore } from "./RootStore";
import { BaseStore } from "./BaseStore";
import { ErrorModel } from "../model/Error";
import { IComboBoxOption } from '@fluentui/react';
import { IGetVehicleResult } from "../model/IGetVehicleResult";

export class VehicleStore extends BaseStore {
    public RootStore: RootStore;
    @observable public Vehicles: Vehicle[] = [];
    @observable public SelectedVehicles: Vehicle[] = [];
    @observable public CurrentVehicle: Vehicle = null;
    @observable public token: string = "";

    public constructor(rootStore: RootStore) {
        super();
        makeObservable(this);
        this.RootStore = rootStore;
    }

    @computed get isVehicleSelected(): boolean {
        return this.CurrentVehicle != null;
    }

    @action
    public SetSelectedVehicles(data: Vehicle[]) {
        this.SelectedVehicles = data;
    }

    @action
    public SetCurrentVehicle(data: Vehicle): void {
        this.CurrentVehicle = data;
    }

    @action
    public DeselectVehicle(cancelEdit?: boolean) {
        this.CurrentVehicle = null;
    }

    @action
    public async Init(): Promise<void> {
        this.startLoading();
        this.startRunning();
        let vehicles: IGetVehicleResult = null;
        if (this.token !== "") {
            if (this.Vehicles[this.Vehicles.length - 1] === null) {
                this.Vehicles.pop();
            }
            vehicles = await this.RootStore.Service.GetVehicles(30, this.token);
        } else {
            this.Vehicles = [];
            vehicles = await this.RootStore.Service.GetVehicles(30);
        }
        runInAction(() => {
            vehicles.carList.forEach(value => {
                const vehicle = new Vehicle(value, this);
                this.Vehicles.push(vehicle);
            });
            this.token = vehicles.token;
            if (this.token !== "") {
                this.Vehicles.push(null);
            }
        });
        this.endRunning();
        this.endLoading();
    }

    @action
    public AddToStore(data: Vehicle) {
        this.Vehicles.push(data);
    }

    @action
    public AddVehicle() {
        const newItem: IVehicleItem = {
            id: '',
            carNumber: '',
            make: '',
            model: '',
            registrationYear: null,
            registrationPlace: '',
            fuelType: '',
            enginePower: 0,
            engineTorque: 0,
            color: '',
            doors: 0
        };
        let newVehicle: Vehicle = new Vehicle(newItem, this);
        newVehicle.panelState = PanelState.Edit;
        this.SetCurrentVehicle(newVehicle);
    }

    @action
    public EditVehicle() {
        if (this.SelectedVehicles !== null && this.SelectedVehicles.length === 1)
            this.SelectedVehicles[0].panelState = PanelState.Edit;
        this.SetCurrentVehicle(this.SelectedVehicles[0]);
    }

    @action
    public async DeleteVehicle() {
        this.startRunning();
        try {
            if (this.SelectedVehicles !== null) {
                const selectedVehilces = this.SelectedVehicles.slice();
                for (let i = 0; i < selectedVehilces.length; i++) {
                    let result = false;
                    result = await this.Delete(selectedVehilces[i].id);
                    if (result) {
                        const index = this.Vehicles.indexOf(selectedVehilces[i]);
                        if (index > -1) {
                            this.Vehicles.splice(index, 1);
                        }
                    }
                }
            }
        } catch {
            this.showError(this.error);
        }
        this.endRunning();
    }

    private async Delete(id: string): Promise<boolean> {
        let result = false;
        this.clearError();
        if (this && this.RootStore.Service) {
            const service = this.RootStore.Service;
            try {
                const deleteResult = await service.DeleteVehicle(id);
                if (deleteResult && (deleteResult as ErrorModel).error) {
                    this.showError(deleteResult as ErrorModel);
                } else {
                    result = true;
                }
            } catch (error) {
                this.showError(error);
            }
        } else {
            this.showError(new ErrorModel({ error: 400, message: "System error" }));
        }
        return result;
    }

    public async ResolveVehicles(): Promise<IComboBoxOption[]> {
        let Vehicles: IComboBoxOption[] = [];
        const vehicles = await this.RootStore.Service.GetVehicles(50);
        runInAction(() => {
            Vehicles = vehicles.carList.map(value => {
                const vehicle = new Vehicle(value, null);
                const option = { key: vehicle.id, text: vehicle.carNumber, data: vehicle }
                return option;
            });
        });
        return Vehicles;
    }
}