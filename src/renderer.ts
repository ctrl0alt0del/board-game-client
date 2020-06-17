
import './index.css';
import 'reflect-metadata';
import { ApplicationEntry } from './ApplicationEntry';
import { AppInjector } from './AppInjector';


const appClass: ApplicationEntry = AppInjector.get(ApplicationEntry);
appClass.main();