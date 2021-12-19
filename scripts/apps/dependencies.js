import { SR5_SystemHelpers } from "../system/utility.js";

export class DependenciesRequiredWindow extends FormApplication {
  constructor(...args) {
    super(...args);
  }

  static get defaultOptions() {
    const options = super.defaultOptions;
    return mergeObject(options, {
      id: "dependencies",
      classes: ["sr5", "warning"],
      template: "systems/sr5/templates/apps/dependencies.html",
      width: document.getElementById("board").width,
      height: document.getElementById("board").height,
      top: 0,
      left: 0,
      submitOnChange: false,
      closeOnSubmit: false,
      minimizable: false,
      popOut: true,
      editable: false,
    });
  }

  activateListeners(html) {
    html.find(".clickToSetup").click(this._sendToSetup.bind(this));
    html.find(".clickToModules").click(this._openModulesWindow.bind(this));
  }

  _openModulesWindow() {
    new ModuleManagement().render(true);
  }

  _sendToSetup() {
    if (game.user.isGM) {
      SR5_SystemHelpers.srLog(2, `${game.user} has shut down the current world`);
      game.shutDown();
    } else {
      SR5_SystemHelpers.srLog(1, `${game.user} tried to shut down the current world`);
    }
  }

}

// Handle system modules requirements
export const checkDependencies = function () {
  let unmetRequirements = [];
  let systemDependencies = game.data.system.data.dependencies;
  let installedComponents = game.data.modules;

  if (!systemDependencies || !systemDependencies.length) {
    SR5_SystemHelpers.srLog(2, `No dependencies configured for the system`);
  } else {
    SR5_SystemHelpers.srLog(2, `Found ${systemDependencies.length} configured ${( systemDependencies.length == 1 ? 'dependency' : 'dependencies')} for the system`);

    for (let dependency of systemDependencies) {
      let component = {};
      let foundComponent = installedComponents.find(obj => obj.id === dependency.name);

      if (!foundComponent) {
        SR5_SystemHelpers.srLog(1, `Dependency '${dependency.name}' is not installed`);
        component.missing = true;
        component.permissions_needed = CONST.USER_ROLES.GAMEMASTER;
      } else {
        if (!foundComponent.active) {
          SR5_SystemHelpers.srLog(1, `Dependency '${dependency.name}' is not activated`);
          component.deactivated = true;
          component.permissions_needed = Math.min.apply(Math, game.permissions.SETTINGS_MODIFY);
        }
        if (dependency.version && (dependency.version > foundComponent.data.version)) {
          SR5_SystemHelpers.srLog(1, `Dependency '${dependency.name}' is outdated (needed ${dependency.version}, found ${foundComponent.data.version})`);
          component.outdated = true;
          component.version_needed = dependency.version;
          component.version_current = foundComponent.data.version;
          component.permissions_needed = CONST.USER_ROLES.GAMEMASTER;
        }
      }

      if (!Object.keys(component).length) {
        SR5_SystemHelpers.srLog(3, `Dependency '${dependency.name}' is compliant with the game system requirements`);
      } else {
        component.name = dependency.name;
        component.permissions_current = game.users.current.data.role;
        switch (dependency.type) {
          case 'module':
          case undefined:
            component.type = game.i18n.localize('SR5.DEPENDENCIES_Module').toLowerCase();
            break;
          default:
            SR5_SystemHelpers.srLog(0, `Dependency '${dependency.name}' has unknown '${dependency.type}' type`);
        }
        if (dependency.manifest) component.manifest = dependency.manifest;
        unmetRequirements.push(component);
      }

    }

    if (Object.keys(unmetRequirements).length) {
      if (game.permissions.SETTINGS_MODIFY.includes(game.users.current.data.role)) {
        SR5_SystemHelpers.srLog(3, "Depencies check unmet requirements", unmetRequirements);
        const app = new DependenciesRequiredWindow(unmetRequirements);
        app.render(true);
      }
    } else {
        SR5_SystemHelpers.srLog(2, `All dependencies are compliant with the game system requirements`);
    }
  }

};