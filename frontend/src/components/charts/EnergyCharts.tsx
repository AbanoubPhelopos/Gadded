import { t, activeLocale } from '../../state/locale'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {number, compact} from '../../lib/format'
import type {AssessmentResponse} from '../../data/types'

const grid = {stroke: '#e9eeeb', strokeDasharray: '3 4', vertical: false}
const axis = {axisLine: false as const, tickLine: false as const, tick: {fontSize: 11, fill: '#7b8981'}}
const tooltipStyle = {border: '1px solid #e0e6df', borderRadius: 12, fontSize: 12, boxShadow: '0 8px 30px #123b3212'}
export function EnergyChart({data, daily = false}: {data: AssessmentResponse; daily?: boolean}) {
  return <div className="chart-wrap" role="img" aria-label={daily ? t("Average daily factory demand and solar generation in kW by hour") : t("Monthly factory consumption and solar generation in kWh")}><ResponsiveContainer width="100%" height="100%">
    {daily ? <AreaChart data={data.dailyEnergy} margin={{top: 12, right: 12, left: 6, bottom: 10}}>
      <defs><linearGradient id="pvFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ebbb54" stopOpacity={.35}/><stop offset="100%" stopColor="#ebbb54" stopOpacity={0}/></linearGradient></defs>
      <CartesianGrid {...grid}/><XAxis dataKey="hour" {...axis} interval={3}/><YAxis {...axis} width={48} label={{value: t("Power (kW)"), angle: -90, position: 'insideLeft', fontSize: 10, fill: '#7b8981'}}/>
      <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${number(Number(v), 1)} kW`}/><Legend iconType="circle" wrapperStyle={{fontSize: 11, paddingTop: 12}}/>
      <Area type="monotone" dataKey="load" name={t("Factory demand")} stroke="#226b53" strokeWidth={2} fill="#e9f2ec"/>
      <Area type="monotone" dataKey="pv" name={t("Solar generation")} stroke="#d5a13b" strokeWidth={2.5} fill="url(#pvFill)"/>
    </AreaChart> : <BarChart data={data.monthlyEnergy.map((row,i) => ({...row, month: new Date(2025,i,1).toLocaleString(activeLocale,{month: 'short'})}))} barGap={3} margin={{top: 12, right: 8, left: 6, bottom: 10}}>
      <CartesianGrid {...grid}/><XAxis dataKey="month" {...axis}/><YAxis {...axis} width={48} tickFormatter={n => `${n/1000}k`} label={{value: t("Energy (kWh)"), angle: -90, position: 'insideLeft', fontSize: 10, fill: '#7b8981'}}/>
      <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${number(Number(v))} kWh`}/><Legend iconType="circle" wrapperStyle={{fontSize: 11, paddingTop: 12}}/>
      <Bar dataKey="load" name={t("Factory consumption")} fill="#dce7e0" radius={[4,4,0,0]} maxBarSize={21}/>
      <Bar dataKey="pv" name={t("Solar generation")} fill="#26745a" radius={[4,4,0,0]} maxBarSize={21}/>
    </BarChart>}
  </ResponsiveContainer></div>
}
export function CandidateChart({data}: {data: AssessmentResponse}) {
  return <div className="chart-wrap" role="img" aria-label={t("Candidate capacity in kW compared with net present value in EGP")}><ResponsiveContainer width="100%" height="100%"><LineChart data={data.candidates} margin={{top: 15, right: 20, bottom: 25, left: 10}}>
    <CartesianGrid {...grid}/><XAxis dataKey="capacity_kw" {...axis} label={{value: t("System capacity (kW)"), position: 'insideBottom', offset: -16, fontSize: 11}}/><YAxis {...axis} tickFormatter={compact} width={55} label={{value: t("NPV (EGP)"), angle: -90, position: 'insideLeft', fontSize: 10}}/>
    <Tooltip contentStyle={tooltipStyle} labelFormatter={v => `${v} kW`} formatter={v => [`${number(Number(v))} EGP`, t("Net present value")]}/><Line type="monotone" dataKey="npv_egp" stroke="#26745a" strokeWidth={2} dot={false}/>
  </LineChart></ResponsiveContainer></div>
}
