package it.federicopalmieri.metano;

import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

public class MainActivity extends BridgeActivity {

    @Override
    public void onStart() {
        super.onStart();

        // Se il processo di rendering della WebView muore (es. crash del
        // driver GPU, visto su Pixel 8 in produzione), Android di default
        // uccide l'intera app. Qui intercettiamo l'evento: rispondiamo true
        // ("me ne occupo io") e ricreiamo l'Activity, cosi' la WebView
        // rinasce pulita e l'app si ricarica in un paio di secondi grazie
        // alla cache locale del CSV, invece di crashare.
        this.bridge.getWebView().setWebViewClient(
            new BridgeWebViewClient(this.bridge) {
                @Override
                public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
                    recreate();
                    return true;
                }
            }
        );
    }
}
