import { Application, type IApplicationOptions } from 'pixi.js';

export class PixiApplication {
  private _app: Application;

  init(appOptions?: IApplicationOptions) {
    this._app = new Application(appOptions);
  }

  get application() {
    return this._app;
  }

}