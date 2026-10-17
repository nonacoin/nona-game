//+------------------------------------------------------------------+
//| DJI Historical Signal Audit - prototype                           |
//| Scans available MT5 history and exports BUY/SELL signal evidence. |
//| This is an initial research tool, NOT a validated profitable EA.  |
//+------------------------------------------------------------------+
#property strict
#property script_show_inputs
#property version "1.000"
#property description "Historical BUY/SELL signal audit CSV for DJIUSD.x"

input string          InpSymbol             = "DJIUSD.x";
input bool            InpScanM1             = true;
input bool            InpScanM5             = true;
input int             InpMaxBars            = 200000;  // maximum bars per timeframe
input int             InpSwingLookback      = 20;      // prior bars used for structure/liquidity
input int             InpMinScore           = 3;       // minimum confluence score (1..4)
input int             InpCooldownBars       = 5;       // minimum bars between same-direction signals
input int             InpForwardBars        = 20;      // bars after signal used for MFE/MAE only
input int             InpATRPeriod          = 14;
input int             InpEMAFast             = 20;
input int             InpEMASlow             = 50;
input int             InpSessionAsiaStart    = 0;      // broker/server time, hour
input int             InpSessionAsiaEnd      = 8;
input int             InpSessionLondonStart  = 8;
input int             InpSessionLondonEnd    = 13;
input int             InpSessionNYStart      = 13;
input int             InpSessionNYEnd        = 22;
input string          InpOutputFile          = "DJI_HistoricalSignalAudit.csv";

struct SignalRow
  {
   datetime time;
   string   tf;
   string   side;
   double   price;
   int      score;
   string   reasons;
   string   session;
   double   atr;
   double   mfe_points;
   double   mae_points;
   int      forward_bars_used;
  };

string SessionName(datetime t)
  {
   MqlDateTime d; TimeToStruct(t,d);
   int h=d.hour;
   bool asia=(InpSessionAsiaStart<=InpSessionAsiaEnd) ? (h>=InpSessionAsiaStart && h<InpSessionAsiaEnd) : (h>=InpSessionAsiaStart || h<InpSessionAsiaEnd);
   bool lon=(InpSessionLondonStart<=InpSessionLondonEnd) ? (h>=InpSessionLondonStart && h<InpSessionLondonEnd) : (h>=InpSessionLondonStart || h<InpSessionLondonEnd);
   bool ny=(InpSessionNYStart<=InpSessionNYEnd) ? (h>=InpSessionNYStart && h<InpSessionNYEnd) : (h>=InpSessionNYStart || h<InpSessionNYEnd);
   if(lon && ny) return "London-NY overlap";
   if(asia) return "Asia";
   if(lon) return "London";
   if(ny) return "New York";
   return "Outside configured sessions";
  }

bool IsInWindow(int hour,int start_hour,int end_hour)
  {
   if(start_hour<=end_hour) return (hour>=start_hour && hour<end_hour);
   return (hour>=start_hour || hour<end_hour);
  }

void CalculateEMA(const MqlRates &rates[],int n,int period,double &out[])
  {
   ArrayResize(out,n);
   if(n<=0) return;
   double alpha=2.0/(period+1.0);
   out[0]=rates[0].close;
   for(int i=1;i<n;i++) out[i]=alpha*rates[i].close+(1.0-alpha)*out[i-1];
  }

double CalcATR(const MqlRates &rates[],int i,int period)
  {
   if(i<1) return 0.0;
   int first=MathMax(1,i-period+1);
   double sum=0.0; int count=0;
   for(int j=first;j<=i;j++)
     {
      double tr=MathMax(rates[j].high-rates[j].low,
                        MathMax(MathAbs(rates[j].high-rates[j-1].close),MathAbs(rates[j].low-rates[j-1].close)));
      sum+=tr; count++;
     }
   if(count==0) return 0.0;
   return sum/count;
  }

int ScanTimeframe(string symbol,ENUM_TIMEFRAMES tf,string tf_label,int file_handle)
  {
   int available=Bars(symbol,tf);
   if(available<=InpSwingLookback+InpForwardBars+10)
     {
      Print("Not enough history for ",symbol," ",tf_label,". Bars=",available);
      return 0;
     }
   int requested=MathMin(available,InpMaxBars);
   MqlRates rates[];
   ArraySetAsSeries(rates,false);
   int copied=CopyRates(symbol,tf,0,requested,rates);
   if(copied<=InpSwingLookback+InpForwardBars+10)
     {
      Print("CopyRates failed/insufficient for ",symbol," ",tf_label,". copied=",copied," err=",GetLastError());
      return 0;
     }
   ArraySetAsSeries(rates,false);
   double ema_fast[],ema_slow[];
   CalculateEMA(rates,copied,InpEMAFast,ema_fast);
   CalculateEMA(rates,copied,InpEMASlow,ema_slow);

   int signals=0,last_buy=-1000000,last_sell=-1000000;
   int end_i=copied-InpForwardBars-1;
   for(int i=MathMax(InpSwingLookback,InpEMASlow);i<=end_i;i++)
     {
      double prior_high=-DBL_MAX,prior_low=DBL_MAX;
      for(int k=i-InpSwingLookback;k<i;k++)
        {
         if(rates[k].high>prior_high) prior_high=rates[k].high;
         if(rates[k].low<prior_low) prior_low=rates[k].low;
        }
      bool bos_up=(rates[i].close>prior_high);
      bool bos_down=(rates[i].close<prior_low);
      bool sweep_low=(rates[i].low<prior_low && rates[i].close>prior_low);
      bool sweep_high=(rates[i].high>prior_high && rates[i].close<prior_high);
      bool fvg_up=(i>=2 && rates[i].low>rates[i-2].high);
      bool fvg_down=(i>=2 && rates[i].high<rates[i-2].low);
      bool ema_up=(ema_fast[i]>ema_slow[i] && rates[i].close>ema_fast[i]);
      bool ema_down=(ema_fast[i]<ema_slow[i] && rates[i].close<ema_fast[i]);
      int buy_score=0,sell_score=0;
      string buy_reasons="",sell_reasons="";
      if(bos_up){buy_score++; buy_reasons+="BOS_up;";}
      if(sweep_low){buy_score++; buy_reasons+="Liquidity_sweep_low;";}
      if(fvg_up){buy_score++; buy_reasons+="Bullish_FVG;";}
      if(ema_up){buy_score++; buy_reasons+="EMA_trend_up;";}
      if(bos_down){sell_score++; sell_reasons+="BOS_down;";}
      if(sweep_high){sell_score++; sell_reasons+="Liquidity_sweep_high;";}
      if(fvg_down){sell_score++; sell_reasons+="Bearish_FVG;";}
      if(ema_down){sell_score++; sell_reasons+="EMA_trend_down;";}

      string side=""; int score=0; string reasons="";
      if(buy_score>=InpMinScore && buy_score>sell_score && i-last_buy>=InpCooldownBars)
        { side="BUY"; score=buy_score; reasons=buy_reasons; last_buy=i; }
      else if(sell_score>=InpMinScore && sell_score>buy_score && i-last_sell>=InpCooldownBars)
        { side="SELL"; score=sell_score; reasons=sell_reasons; last_sell=i; }
      if(side=="") continue;

      // Measure only post-signal excursions; this does not determine a win/loss.
      double mfe=0.0,mae=0.0;
      int used=0;
      for(int f=i+1;f<=MathMin(i+InpForwardBars,copied-1);f++)
        {
         if(side=="BUY")
           {
            mfe=MathMax(mfe,rates[f].high-rates[i].close);
            mae=MathMax(mae,rates[i].close-rates[f].low);
           }
         else
           {
            mfe=MathMax(mfe,rates[i].close-rates[f].low);
            mae=MathMax(mae,rates[f].high-rates[i].close);
           }
         used++;
        }
      double point=SymbolInfoDouble(symbol,SYMBOL_POINT);
      if(point<=0.0) point=0.01;
      double atr=CalcATR(rates,i,InpATRPeriod);
      string time_string=TimeToString(rates[i].time,TIME_DATE|TIME_MINUTES);
      FileWrite(file_handle,time_string,tf_label,side,DoubleToString(rates[i].close,(int)SymbolInfoInteger(symbol,SYMBOL_DIGITS)),score,reasons,SessionName(rates[i].time),DoubleToString(atr,(int)SymbolInfoInteger(symbol,SYMBOL_DIGITS)),DoubleToString(mfe/point,1),DoubleToString(mae/point,1),used);
      signals++;
     }
   Print(tf_label,": scanned ",copied," bars; signals exported=",signals);
   return signals;
  }

void OnStart()
  {
   string symbol=InpSymbol;
   if(!SymbolSelect(symbol,true))
     {
      Print("Cannot select symbol ",symbol,". Check exact broker symbol name.");
      return;
     }
   int fh=FileOpen(InpOutputFile,FILE_WRITE|FILE_CSV|FILE_ANSI,',');
   if(fh==INVALID_HANDLE)
     {
      Print("Cannot create report file. Error=",GetLastError());
      return;
     }
   FileWrite(fh,"SignalTime","Timeframe","Signal","SignalClose","Score_0_to_4","Reasons","Session_server_time","ATR","MFE_points_next_N_bars","MAE_points_next_N_bars","ForwardBarsUsed");
   int total=0;
   if(InpScanM1) total+=ScanTimeframe(symbol,PERIOD_M1,"M1",fh);
   if(InpScanM5) total+=ScanTimeframe(symbol,PERIOD_M5,"M5",fh);
   FileClose(fh);
   Print("Historical audit finished. Total signals=",total,". File is in MQL5/Files/",InpOutputFile," (or tester agent Files when run in Strategy Tester).");
   Alert("Historical signal audit finished: ",total," signals. See Experts log for file location.");
  }
//+------------------------------------------------------------------+
