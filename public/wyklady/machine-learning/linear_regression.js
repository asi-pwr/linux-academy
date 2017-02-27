function linearRegression(data, alpha) {
    var gd = new GradientDescent(data, linearRegression.cost, linearRegression.dcost);
    var h = null;
    for(var j = 0; j < 1000; j++) {
        h = gd.step(alpha, h);
    }
    return [h, gd.cost(), gd];
}

linearRegression.cost = function(x, h) {
    var result = h[0];
    for(var i = 0; i < x.length - 1; i++) {
        result += x[i]*h[i+1];
    }
    return Math.pow(result - x[x.length - 1], 2);
};

linearRegression.dcost = function(x, h) {
    var result = h[0];
    for(var i = 0; i < x.length - 1; i++) {
        result += x[i]*h[i+1];
    }
    return result - x[x.length - 1];
};

function GradientDescent(data, sample_cost, sample_dcost) {
    this.data = data;
    this.sample_cost = sample_cost;
    this.sample_dcost = sample_dcost;
}

GradientDescent.prototype = {
    cost: function(h) {
        if(!h) h = this.h;
        var sum = 0;
        for(var i = 0; i < this.data.length; i++) {
            sum += this.sample_cost(this.data[i], h);
        }
        return sum / this.data.length / 2;
    },

    step: function(alpha, h) {
        var X = this.data;
        var cost_sum = 0;
        if(!h) h = this.h;
        if(!h) {
            h = [];
            for(var i=0; i < X[0].length; i++) h.push(0);
        }
        for(var i = 0; i < X.length; i++) {
            cost_sum += this.sample_dcost(X[i], h);
        }
        cost_sum *= alpha / X.length;

        var new_h = [h[0] - cost_sum];
        for(var i = 0; i < X[0].length - 1; i++) { // Loop over variables
            var cost_sum = 0;
            for(var j = 0; j < X.length; j++) { // Loop over records
                cost_sum += this.sample_dcost(X[j], h) * X[j][i];
            }
            cost_sum *= alpha / X.length;

            new_h.push(h[i+1] - cost_sum);
        }
        return this.h = new_h;
    }
};

function cost_ellipse(X) {
    var a = X.length;
    var b = 0, c = 0, d = 0, f = 0, g = 0;
    for(var i = 0; i < X.length; i++) {
        b += X[i][0] / a * 2;
        c += Math.pow(X[i][0], 2) / a;
        d -= X[i][1] / a * 2;
        f -= X[i][0] * X[i][1] / a * 2;
        g += Math.pow(X[i][1], 2) / a;
    }
    a = 1;

    var cost = function(theta) {
        return a*Math.pow(theta[0], 2) + theta[0]*theta[1]*b + Math.pow(theta[1], 2)*c + theta[0] * d + theta[1] * f + g;
    }

    var solve_cost = function(h, sign, x) {
        return (sign * Math.sqrt(Math.pow(b*x + f, 2) - 4*c*(a*x*x + d*x + g - h)) - b*x - f) / (2*c);
    }

    return {
        isoline: function(h, t) {
            var sign = t <= Math.PI ? -1 : 1;
            var q_a = b*b - 4*a*c,
                q_b = 2*b*f - 4*c*d,
                q_c = f*f - 4*c*(g-h);
            var delta = q_b*q_b - 4*q_a*q_c;
            var x1 = ( Math.sqrt(delta) - q_b) / (2*q_a) + 0.01;
            var x2 = (-Math.sqrt(delta) - q_b) / (2*q_a);
            t = t <= Math.PI ? t : 2*Math.PI-t;
            t = x1 + t / Math.PI * (x2 - x1);
            return [t, solve_cost(h, sign, t)];
        },
        cost: cost
    };
}
